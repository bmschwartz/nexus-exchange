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

interface OrderOperationResponse {
  success: boolean
  error?: string
  order?: object
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

  _createBitmexOrderQueue?: Amqp.Queue

  // Event Queues
  _binanceAccountHeartbeatQueue?: Amqp.Queue
  _binanceAccountCreatedQueue?: Amqp.Queue
  _binanceAccountUpdatedQueue?: Amqp.Queue
  _binanceAccountDeletedQueue?: Amqp.Queue

  /* Account Queues */
  _bitmexAccountCreatedQueue?: Amqp.Queue
  _bitmexAccountUpdatedQueue?: Amqp.Queue
  _bitmexAccountDeletedQueue?: Amqp.Queue
  _bitmexAccountHeartbeatQueue?: Amqp.Queue

  /* Order Queues */
  _bitmexOrderCreatedQueue?: Amqp.Queue
  _bitmexOrderUpdatedQueue?: Amqp.Queue
  _bitmexOrderCanceledQueue?: Amqp.Queue

  // Exchanges
  _recvBinanceExchange?: Amqp.Exchange
  _sendBinanceExchange?: Amqp.Exchange

  _recvBitmexExchange?: Amqp.Exchange
  _sendBitmexExchange?: Amqp.Exchange

  _heartbeatJobQueue: Bull.Queue

  constructor(prisma: PrismaClient) {
    _db = prisma
    this._db = prisma
    this._recvConn = new Amqp.Connection(SETTINGS["AMQP_URL"])
    this._sendConn = new Amqp.Connection(SETTINGS["AMQP_URL"])

    this._connectBinanceMessaging()
    this._connectBitmexMessaging()

    this._heartbeatJobQueue = new Bull(
      "heartbeatQueue",
      SETTINGS["REDIS_URL"],
      { defaultJobOptions: { removeOnFail: true, removeOnComplete: true } }
    )
    this._setupHeartbeatJob()
  }

  async _connectBitmexMessaging() {
    /* Exchanges */
    this._recvBitmexExchange = this._recvConn.declareExchange(SETTINGS["BITMEX_EXCHANGE"], "topic", { durable: true })
    this._sendBitmexExchange = this._sendConn.declareExchange(SETTINGS["BITMEX_EXCHANGE"], "topic", { durable: true })

    /* Command queues */
    this._createBitmexAccountQueue = this._sendConn.declareQueue(SETTINGS["BITMEX_CREATE_ACCOUNT_QUEUE"], { durable: true })

    /* Event queues */
    /* Account Events */
    this._bitmexAccountCreatedQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ACCOUNT_CREATED_QUEUE"], { durable: true })
    await this._bitmexAccountCreatedQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ACCOUNT_CREATED_KEY"])
    await this._bitmexAccountCreatedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountCreatedConsumer(this._db, message))

    this._bitmexAccountUpdatedQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ACCOUNT_UPDATED_QUEUE"], { durable: true })
    await this._bitmexAccountUpdatedQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ACCOUNT_UPDATED_KEY"])
    await this._bitmexAccountUpdatedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountUpdatedConsumer(this._db, message))

    this._bitmexAccountDeletedQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ACCOUNT_DELETED_QUEUE"], { durable: true })
    await this._bitmexAccountDeletedQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ACCOUNT_DELETED_KEY"])
    await this._bitmexAccountDeletedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountDeletedConsumer(this._db, message))

    /* Heartbeat Events */
    this._bitmexAccountHeartbeatQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ACCOUNT_HEARTBEAT_QUEUE"], { durable: true })
    await this._bitmexAccountHeartbeatQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ACCOUNT_HEARTBEAT_KEY"])
    await this._bitmexAccountHeartbeatQueue.activateConsumer(this._accountHeartbeatConsumer)

    /* Order Events */
    this._bitmexOrderCreatedQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ORDER_CREATED_QUEUE"], { durable: true })
    await this._bitmexOrderCreatedQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ORDER_CREATED_KEY"])
    await this._bitmexOrderCreatedQueue.activateConsumer(async (message: Amqp.Message) => await this._orderCreatedConsumer(this._db, message))

    this._bitmexOrderUpdatedQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ORDER_UPDATED_QUEUE"], { durable: true })
    await this._bitmexOrderUpdatedQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ORDER_UPDATED_KEY"])
    await this._bitmexOrderUpdatedQueue.activateConsumer(async (message: Amqp.Message) => await this._orderUpdatedConsumer(this._db, message))

    this._bitmexOrderCanceledQueue = this._recvConn.declareQueue(SETTINGS["BITMEX_ORDER_CANCELED_QUEUE"], { durable: true })
    await this._bitmexOrderCanceledQueue.bind(this._recvBitmexExchange, SETTINGS["BITMEX_EVENT_ORDER_CANCELED_KEY"])
    await this._bitmexOrderCanceledQueue.activateConsumer(async (message: Amqp.Message) => await this._orderCanceledConsumer(this._db, message))
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

    this._binanceAccountHeartbeatQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_HEARTBEAT_QUEUE"], { durable: true })
    await this._binanceAccountHeartbeatQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_HEARTBEAT_KEY"])
    await this._binanceAccountHeartbeatQueue.activateConsumer(this._accountHeartbeatConsumer)
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
      message.reject(false)
      return
    }

    if (!accountId) {
      message.reject(false)
      return
    }

    await completeAsyncOperation(prisma, operationId, success, error)

    if (success) {
      await prisma.exchangeAccount.update({
        where: { id: accountId },
        data: { active: true, lastHeartbeat: new Date() },
      })
    } else {
      await prisma.exchangeAccount.delete({
        where: { id: accountId }
      })
    }

    message.ack()
  }

  async _accountUpdatedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    message.ack()
  }

  async _accountDeletedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    const { success, accountId, error }: AccountOperationResponse = message.getContent()
    const { correlationId: operationId } = message.properties

    if (!operationId) {
      message.reject(false)
      return
    }

    const operation = await completeAsyncOperation(prisma, operationId, success, error)

    if (operation && accountId && success) {
      switch (operation.opType) {
        case OperationType.DELETE_BITMEX_ACCOUNT:
        case OperationType.DELETE_BINANCE_ACCOUNT: {
          await prisma.exchangeAccount.delete({ where: { id: accountId } })
          break;
        }
        case OperationType.DISABLE_BITMEX_ACCOUNT:
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

  async _orderCreatedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    const { success, order, error }: OrderOperationResponse = message.getContent()
    const { correlationId: operationId } = message.properties

    if (!operationId) {
      message.reject(false)
      return
    }

    await completeAsyncOperation(prisma, operationId, success, error)

    if (success) {
      //   await prisma.exchangeAccount.update({
      //     where: { id: accountId },
      //     data: { active: true, lastHeartbeat: new Date() },
      //   })
      // } else {
      //   await prisma.exchangeAccount.delete({
      //     where: { id: accountId }
      //   })
      console.log({ order })
    }

    message.ack()
  }

  async _orderUpdatedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    message.ack()
  }

  async _orderCanceledConsumer(prisma: PrismaClient, message: Amqp.Message) {
    message.ack()
  }

  async sendCreateBitmexAccount(accountId: number, apiKey: string, apiSecret: string): Promise<number> {
    const payload = { accountId, apiKey, apiSecret }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.CREATE_BITMEX_ACCOUNT)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, SETTINGS["BITMEX_CREATE_ACCOUNT_CMD_KEY"])

    return op.id
  }

  async sendUpdateBitmexAccount(accountId: number, apiKey: string, apiSecret: string) {
    const payload = { accountId, apiKey, apiSecret }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.UPDATE_BITMEX_ACCOUNT)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, `${SETTINGS["BITMEX_UPDATE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

  async sendDeleteBitmexAccount(accountId: number, disabling?: boolean) {
    const payload = { accountId }

    const opType = disabling ? OperationType.DISABLE_BITMEX_ACCOUNT : OperationType.DELETE_BITMEX_ACCOUNT

    const op = await createAsyncOperation(this._db, { payload }, opType)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, `${SETTINGS["BITMEX_DELETE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

  async sendCreateBinanceAccount(accountId: number, apiKey: string, apiSecret: string): Promise<number> {
    const payload = { accountId, apiKey, apiSecret }

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

  async sendCreateBitmexOrder(accountId: number, data: any): Promise<number> {
    const payload = { accountId, ...data }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.CREATE_BITMEX_ORDER)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    console.log(`${SETTINGS["BITMEX_CREATE_ORDER_CMD_PREFIX"]}${accountId}`)
    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, `${SETTINGS["BITMEX_CREATE_ORDER_CMD_PREFIX"]}${accountId}`)

    return op.id
  }

  async sendUpdateBitmexOrder(accountId: number, data: any) {
    const { orderId } = data
    const payload = { accountId, orderId }

    const op = await createAsyncOperation(this._db, { payload }, OperationType.UPDATE_BITMEX_ORDER)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, `${SETTINGS["BITMEX_UPDATE_ORDER_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

  async sendCancelBitmexOrder(accountId: number, orderId: number) {
    const payload = { accountId, orderId }

    const opType = OperationType.CANCEL_BITMEX_ORDER

    const op = await createAsyncOperation(this._db, { payload }, opType)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })
    this._sendBitmexExchange?.send(message, `${SETTINGS["BITMEX_CANCEL_ORDER_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

  async _setupHeartbeatJob() {
    this._heartbeatJobQueue.process(FLUSH_HEARTBEAT_JOB, this._flushAccountHeartbeats)

    const jobs: JobInformation[] = await this._heartbeatJobQueue.getRepeatableJobs()
    jobs.forEach(async (job: JobInformation) => {
      await this._heartbeatJobQueue.removeRepeatableByKey(job.key)
    })
    await this._heartbeatJobQueue.add(FLUSH_HEARTBEAT_JOB, {}, { repeat: { every: FLUSH_HEARTBEAT_INTERVAL } })
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
