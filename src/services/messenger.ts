import * as Amqp from "amqp-ts"
import { PrismaClient, OperationType } from "@prisma/client";
import { SETTINGS } from "../settings";


export class MessageClient {
  _db: PrismaClient
  _conn: Amqp.Connection

  // Command Queues
  _createBinanceAccountQueue?: Amqp.Queue
  _updateBinanceAccountQueue?: Amqp.Queue
  _deleteBinanceAccountQueue?: Amqp.Queue

  // Event Queues
  _binanceAccountCreatedQueue?: Amqp.Queue
  _binanceAccountUpdatedQueue?: Amqp.Queue
  _binanceAccountDeletedQueue?: Amqp.Queue

  // Exchanges
  _binanceExchange?: Amqp.Exchange

  constructor(prisma: PrismaClient) {
    this._db = prisma
    this._conn = new Amqp.Connection(SETTINGS["AMQP_URL"])

    this._connectBinanceMessaging()
  }

  async _connectBinanceMessaging() {
    // Exchanges
    this._binanceExchange = this._conn.declareExchange(SETTINGS["BINANCE_EXCHANGE"], "topic", { durable: true })

    // Command queues
    this._createBinanceAccountQueue = this._conn.declareQueue(SETTINGS["CREATE_BINANCE_ACCOUNT_QUEUE"], { durable: true })
    this._updateBinanceAccountQueue = this._conn.declareQueue(SETTINGS["UPDATE_BINANCE_ACCOUNT_QUEUE"], { durable: true })
    this._deleteBinanceAccountQueue = this._conn.declareQueue(SETTINGS["DELETE_BINANCE_ACCOUNT_QUEUE"], { durable: true })

    // Event queues
    this._binanceAccountCreatedQueue = this._conn.declareQueue(SETTINGS["BINANCE_ACCOUNT_CREATED_QUEUE"], { durable: true })
    await this._binanceAccountCreatedQueue.bind(this._binanceExchange, SETTINGS["BINANCE_ACCOUNT_CREATED_EVENT_KEY"])
    await this._binanceAccountCreatedQueue.activateConsumer(async (message: Amqp.Message) => {
      console.log(message.content.toString())
      message.ack()
    })

    this._binanceAccountUpdatedQueue = this._conn.declareQueue(SETTINGS["BINANCE_ACCOUNT_UPDATED_QUEUE"], { durable: true })
    await this._binanceAccountUpdatedQueue.bind(this._binanceExchange, SETTINGS["BINANCE_ACCOUNT_UPDATED_EVENT_KEY"])
    await this._binanceAccountUpdatedQueue.activateConsumer(async (message: Amqp.Message) => {
      console.log(message.content.toString())
      message.ack()
    })

    this._binanceAccountDeletedQueue = this._conn.declareQueue(SETTINGS["BINANCE_ACCOUNT_DELETED_QUEUE"], { durable: true })
    await this._binanceAccountDeletedQueue.bind(this._binanceExchange, SETTINGS["BINANCE_ACCOUNT_DELETED_EVENT_KEY"])
    await this._binanceAccountDeletedQueue.activateConsumer(async (message: Amqp.Message) => {
      console.log(message.content.toString())
      message.ack()
    })

  }

  async sendCreateBinanceAccount(accountId: string, apiKey: string, apiSecret: string) {
    const payload = { accountId, apiKey, apiSecret }

    const message = new Amqp.Message(payload)
    this._createBinanceAccountQueue?.send(message)

    const op = await this._db.asyncOperation.create({
      data: { payload, opType: OperationType.CREATE_BINANCE_ACCOUNT }
    })
  }

  async sendUpdateBinanceAccount() {

  }

  async sendDeleteBinanceAccount() {

  }

}
