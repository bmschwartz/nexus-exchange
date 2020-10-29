import * as Amqp from "amqp-ts"
import { PrismaClient, OperationType } from "@prisma/client";
import { SETTINGS } from "../settings";
import { createAsyncOperation, completeAsyncOperation } from "../repository/AsyncOperationRepository";

interface AccountCreatedResponse {
  success: boolean
  error?: string
  accountId: number
  operationId: number
}

export class MessageClient {
  _db: PrismaClient
  _recvConn: Amqp.Connection
  _sendConn: Amqp.Connection

  // Command Queues
  _createBinanceAccountQueue?: Amqp.Queue
  _updateBinanceAccountQueue?: Amqp.Queue
  _deleteBinanceAccountQueue?: Amqp.Queue

  // Event Queues
  _binanceAccountCreatedQueue?: Amqp.Queue
  _binanceAccountUpdatedQueue?: Amqp.Queue
  _binanceAccountDeletedQueue?: Amqp.Queue

  // Exchanges
  _recvBinanceExchange?: Amqp.Exchange
  _sendBinanceExchange?: Amqp.Exchange

  constructor(prisma: PrismaClient) {
    this._db = prisma
    this._recvConn = new Amqp.Connection(SETTINGS["AMQP_URL"])
    this._sendConn = new Amqp.Connection(SETTINGS["AMQP_URL"])

    this._connectBinanceMessaging()
  }

  async _connectBinanceMessaging() {
    // Exchanges
    this._recvBinanceExchange = this._recvConn.declareExchange(SETTINGS["BINANCE_EXCHANGE"], "topic", { durable: true })
    this._sendBinanceExchange = this._sendConn.declareExchange(SETTINGS["BINANCE_EXCHANGE"], "topic", { durable: true })

    // Command queues
    this._createBinanceAccountQueue = this._sendConn.declareQueue(SETTINGS["BINANCE_CREATE_ACCOUNT_QUEUE"], { durable: true })
    this._updateBinanceAccountQueue = this._sendConn.declareQueue(SETTINGS["BINANCE_UPDATE_ACCOUNT_QUEUE"], { durable: true })
    this._deleteBinanceAccountQueue = this._sendConn.declareQueue(SETTINGS["BINANCE_DELETE_ACCOUNT_QUEUE"], { durable: true })

    // Event queues
    this._binanceAccountCreatedQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_CREATED_QUEUE"], { durable: true })
    await this._binanceAccountCreatedQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_CREATED_KEY"])
    await this._binanceAccountCreatedQueue.activateConsumer(async (message: Amqp.Message) => await this._accountCreatedConsumer(this._db, message))

    this._binanceAccountUpdatedQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_UPDATED_QUEUE"], { durable: true })
    await this._binanceAccountUpdatedQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_UPDATED_KEY"])
    await this._binanceAccountUpdatedQueue.activateConsumer(this._accountUpdatedConsumer)

    this._binanceAccountDeletedQueue = this._recvConn.declareQueue(SETTINGS["BINANCE_ACCOUNT_DELETED_QUEUE"], { durable: true })
    await this._binanceAccountDeletedQueue.bind(this._recvBinanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_DELETED_KEY"])
    await this._binanceAccountDeletedQueue.activateConsumer(this._accountDeletedConsumer)
  }

  async _accountCreatedConsumer(prisma: PrismaClient, message: Amqp.Message) {
    const { success, accountId, error }: AccountCreatedResponse = message.getContent()
    const { correlationId: operationId } = message.properties

    if (!operationId) {
      console.error(`Missing Operation ID in accountCreated response [accountId: ${accountId}]`)
      message.reject(false)
      return
    }

    await completeAsyncOperation(prisma, operationId, success, error)

    if (accountId) {
      await prisma.exchangeAccount.update({
        where: { id: accountId },
        data: { active: success },
      })
    }

    message.ack()
  }

  async _accountUpdatedConsumer(message: Amqp.Message) {
    console.log(message.properties, message.getContent())
    message.ack()
  }

  async _accountDeletedConsumer(message: Amqp.Message) {
    console.log(message.properties, message.getContent())
    message.ack()
  }

  async sendCreateBinanceAccount(userId: number, accountId: number, apiKey: string, apiSecret: string): Promise<number> {
    const payload = { accountId, apiKey, apiSecret }

    if (!this._createBinanceAccountQueue) {
      throw new Error()
    }

    const op = await createAsyncOperation(this._db, { userId, payload }, OperationType.CREATE_BINANCE_ACCOUNT)

    if (!op) {
      throw new Error("Could not create asyncOperation")
    }

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })

    console.log(`sending create account payload ${JSON.stringify(payload)}`)
    this._sendBinanceExchange?.send(message, SETTINGS["BINANCE_CREATE_ACCOUNT_CMD_KEY"])

    return op.id
  }

  async sendUpdateBinanceAccount(userId: number, accountId: number, apiKey: string, apiSecret: string) {
    const payload = { accountId, apiKey, apiSecret }

    if (!this._updateBinanceAccountQueue) {
      throw new Error()
    }

    const op = await this._db.asyncOperation.create({
      data: { userId, payload, opType: OperationType.UPDATE_BINANCE_ACCOUNT }
    })

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })

    console.log(`sending update account payload ${JSON.stringify(payload)} on ${SETTINGS["BINANCE_UPDATE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)
    this._sendBinanceExchange?.send(message, `${SETTINGS["BINANCE_UPDATE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

  async sendDeleteBinanceAccount(userId: number, accountId: number) {
    const payload = { accountId }

    if (!this._deleteBinanceAccountQueue) {
      throw new Error()
    }

    const op = await this._db.asyncOperation.create({
      data: { userId, payload, opType: OperationType.DELETE_BINANCE_ACCOUNT }
    })

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })

    console.log(`sending delete account payload ${JSON.stringify(payload)} on ${SETTINGS["BINANCE_DELETE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)
    this._sendBinanceExchange?.send(message, `${SETTINGS["BINANCE_DELETE_ACCOUNT_CMD_KEY_PREFIX"]}${accountId}`)

    return op.id
  }

}
