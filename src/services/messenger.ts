import * as Amqp from "amqp-ts"
import Bull, { Job, JobInformation } from "bull"
import { PrismaClient, OperationType } from "@prisma/client";
import { SETTINGS } from "../settings";
import { createAsyncOperation, completeAsyncOperation } from "../repository/AsyncOperationRepository";

interface AccountOperationResponse {
  success: boolean
  error?: string
  accountId: number
  operationId: number
}

interface HeartbeatResponse {
  accountId: number
}

const FLUSH_HEARTBEAT_JOB = "flushHeartbeats"
const FLUSH_HEARTBEAT_INTERVAL = 5000 // ms

let accountHeartbeats: object = {}
const heartbeats: Set<number> = new Set<number>()

let _db: PrismaClient

export class MessageClient {
  _db: PrismaClient
  _recvConn: Amqp.Connection
  _sendConn: Amqp.Connection

  // Command Queues
  _createBinanceAccountQueue?: Amqp.Queue
  _createBitmexAccountQueue?: Amqp.Queue

  // Event Queues
  _binanceAccountHeartbeatQueue?: Amqp.Queue
  _binanceAccountCreatedQueue?: Amqp.Queue
  _binanceAccountUpdatedQueue?: Amqp.Queue
  _binanceAccountDeletedQueue?: Amqp.Queue

  _bitmexAccountCreatedQueue?: Amqp.Queue
  _bitmexAccountUpdatedQueue?: Amqp.Queue
  _bitmexAccountDeletedQueue?: Amqp.Queue
  _bitmexAccountHeartbeatQueue?: Amqp.Queue

  // Exchanges
  _recvBinanceExchange?: Amqp.Exchange
  _sendBinanceExchange?: Amqp.Exchange

  _recvBitmexExchange?: Amqp.Exchange
  _sendBitmexExchange?: Amqp.Exchange

  _heartbeatQueue: Bull.Queue

  constructor(prisma: PrismaClient) {
    _db = prisma
    this._db = prisma
    this._recvConn = new Amqp.Connection(SETTINGS["AMQP_URL"])
    this._sendConn = new Amqp.Connection(SETTINGS["AMQP_URL"])

    this._connectBinanceMessaging()
    this._connectBitmexMessaging()

    this._heartbeatQueue = new Bull("heartbeatQueue")
    this._setupHeartbeatJob()
  }

  async _connectBitmexMessaging() {
    /* Exchanges */
    this._recvBitmexExchange = this._recvConn.declareExchange(SETTINGS["BITMEX_EXCHANGE"], "topic", { durable: true })
    this._sendBitmexExchange = this._sendConn.declareExchange(SETTINGS["BITMEX_EXCHANGE"], "topic", { durable: true })

    /* Command queues */
    this._createBitmexAccountQueue = this._sendConn.declareQueue(SETTINGS["BITMEX_CREATE_ACCOUNT_QUEUE"], { durable: true })

    /* Event queues */
    this._bitmexAccountHeartbeatQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ACCOUNT_HEARTBEAT_QUEUE"], { durable: true })
    await this._bitmexAccountHeartbeatQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ACCOUNT_HEARTBEAT_KEY"])
    await this._bitmexAccountHeartbeatQueue.activateConsumer(this._accountHeartbeatConsumer)
  }

  async _connectBinanceMessaging() {
    /* Exchanges */
    this._recvBinanceExchange = this._recvConn.declareExchange(SETTINGS["BINANCE_EXCHANGE"], "topic", { durable: true })
    this._sendBinanceExchange = this._sendConn.declareExchange(SETTINGS["BINANCE_EXCHANGE"], "topic", { durable: true })

    /* Command queues */
    this._createBinanceAccountQueue = this._sendConn.declareQueue(SETTINGS["BINANCE_CREATE_ACCOUNT_QUEUE"], { durable: true })

    /* Event queues */
    this._binanceAccountCreatedQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_CREATED_QUEUE"], { durable: true })
    await this._binanceAccountCreatedQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_CREATED_KEY"])
    await this._binanceAccountCreatedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountCreatedConsumer(this._db, message))

    this._binanceAccountUpdatedQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_UPDATED_QUEUE"], { durable: true })
    await this._binanceAccountUpdatedQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_UPDATED_KEY"])
    await this._binanceAccountUpdatedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountUpdatedConsumer(this._db, message))

    this._binanceAccountDeletedQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_DELETED_QUEUE"], { durable: true })
    await this._binanceAccountDeletedQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_DELETED_KEY"])
    await this._binanceAccountDeletedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountDeletedConsumer(this._db, message))
  }

  async _accountHeartbeatConsumer(message: Amqp.Message) {
    const { accountId }: HeartbeatResponse = message.getContent()

    if (!accountId) {
      console.error("Account ID missing in Account Heartbeat")
      message.reject(false)
      return
    }

    accountHeartbeats[accountId] = new Date()
    heartbeats.add(accountId)

    message.ack()
  }

  async _accountCreatedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    const { success, accountId, error }: AccountOperationResponse = message.getContent()
    const { correlationId: operationId } = message.properties

    if (!operationId) {
      console.error(`Missing Operation ID in accountCreated response [accountId: ${accountId}]`)
      message.reject(false)
      return
    }

    if (!accountId) {
      console.error(`Missing Account ID in accountCreated response`)
      message.reject(false)
      return
    }

    await completeAsyncOperation(prisma, operationId, success, error)

    if (success) {
      await prisma.exchangeAccount.update({
        where: { id: accountId },
        data: { active: true },
      })
    } else {
      await prisma.exchangeAccount.delete({
        where: { id: accountId }
      })
    }

    message.ack()
  }

  async _accountUpdatedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    console.log(message.properties, message.getContent())
    message.ack()
  }

  async _accountDeletedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    const { success, accountId, error }: AccountOperationResponse = message.getContent()
    const { correlationId: operationId } = message.properties

    if (!operationId) {
      console.error(`Missing Operation ID in accountDeleted response [accountId: ${accountId}]`)
      message.reject(false)
      return
    }

    const operation = await completeAsyncOperation(prisma, operationId, success, error)

    if (operation && accountId && success) {
      switch (operation.opType) {
        case OperationType.DELETE_BINANCE_ACCOUNT: {
          await prisma.exchangeAccount.delete({ where: { id: accountId } })
          break;
        }
        case OperationType.DISABLE_BINANCE_ACCOUNT: {
          await prisma.exchangeAccount.update({
            where: { id: accountId },
            data: { active: false }
          })
          break;
        }
        default: {
          console.error("Invalid op type")
        }
      }
    }

    message.ack()
  }

  async sendCreateBitmexAccount(accountId: number, apiKey: string, apiSecret: string): Promise<number> {
    const payload = { accountId, apiKey, apiSecret }

    if (!this._createBitmexAccountQueue) {
      throw new Error()
    }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.CREATE_BITMEX_ACCOUNT)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, SETTINGS["BITMEX_CREATE_ACCOUNT_CMD_KEY"])

    return op.id
  }

  async sendCreateBinanceAccount(accountId: number, apiKey: string, apiSecret: string): Promise<number> {
    const payload = { accountId, apiKey, apiSecret }

    if (!this._createBinanceAccountQueue) {
      throw new Error()
    }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.CREATE_BINANCE_ACCOUNT)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBinanceExchange?.send(message, SETTINGS["BINANCE_CREATE_ACCOUNT_CMD_KEY"])

    return op.id
  }

  async sendUpdateBinanceAccount(accountId: number, apiKey: string, apiSecret: string) {
    const payload = { accountId, apiKey, apiSecret }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.UPDATE_BINANCE_ACCOUNT)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBinanceExchange?.send(message, `${SETTINGS["BINANCE_UPDATE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

  async sendDeleteBinanceAccount(accountId: number, disabling?: boolean) {
    const payload = { accountId }

    const opType = disabling ? OperationType.DISABLE_BINANCE_ACCOUNT : OperationType.DELETE_BINANCE_ACCOUNT

    const op = await createAsyncOperation(this._db, { payload }, opType)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBinanceExchange?.send(message, `${SETTINGS["BINANCE_DELETE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }


  async _setupHeartbeatJob() {
    this._heartbeatQueue.process(FLUSH_HEARTBEAT_JOB, this._flushAccountHeartbeats)

    const jobs: JobInformation[] = await this._heartbeatQueue.getRepeatableJobs()
    jobs.forEach(async (job: JobInformation) => {
      await this._heartbeatQueue.removeRepeatableByKey(job.key)
    })
    await this._heartbeatQueue.add(FLUSH_HEARTBEAT_JOB, {}, { repeat: { every: FLUSH_HEARTBEAT_INTERVAL } })
  }

  async _flushAccountHeartbeats(job: Job) {
    if (!_db) {
      return
    }

    await _db.exchangeAccount.updateMany({
      where: { id: { in: Array.from(heartbeats) } },
      data: { lastHeartbeat: new Date() }
    })

    heartbeats.clear()
  }

}
