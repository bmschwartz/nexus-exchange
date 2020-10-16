import * as Amqp from "amqp-ts"
import { PrismaClient, OperationType } from "@prisma/client";
import { SETTINGS } from "../settings";

interface AccountCreatedResponse {
  success: boolean
  error?: string
  accountId: number
  operationId: number
}

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
    this._createBinanceAccountQueue = this._conn.declareQueue(SETTINGS["BINANCE_CREATE_ACCOUNT_QUEUE"], { durable: true })

    // Event queues
    this._binanceAccountCreatedQueue = this._conn.declareQueue(SETTINGS["BINANCE_ACCOUNT_CREATED_QUEUE"], { durable: true })
    await this._binanceAccountCreatedQueue.bind(this._binanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_CREATED_KEY"])
    await this._binanceAccountCreatedQueue.activateConsumer(async (message: Amqp.Message) => {
      message.ack()

      const { success, accountId, error }: AccountCreatedResponse = message.getContent()
      const { correlationId: operationId } = message.properties

      await this._db.asyncOperation.update({
        where: { id: Number.parseInt(operationId) },
        data: {
          complete: true,
          success,
          error,
        }
      })

      await this._db.exchangeAccount.update({
        where: { id: accountId },
        data: { active: success },
      })
    })

    this._binanceAccountUpdatedQueue = this._conn.declareQueue(SETTINGS["BINANCE_ACCOUNT_UPDATED_QUEUE"], { durable: true })
    await this._binanceAccountUpdatedQueue.bind(this._binanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_UPDATED_KEY"])
    await this._binanceAccountUpdatedQueue.activateConsumer(async (message: Amqp.Message) => {
      console.log(message.properties, message.getContent())
      message.ack()
    })

    this._binanceAccountDeletedQueue = this._conn.declareQueue(SETTINGS["BINANCE_ACCOUNT_DELETED_QUEUE"], { durable: true })
    await this._binanceAccountDeletedQueue.bind(this._binanceExchange, SETTINGS["BINANCE_EVENT_ACCOUNT_DELETED_KEY"])
    await this._binanceAccountDeletedQueue.activateConsumer(async (message: Amqp.Message) => {
      console.log(message.properties, message.getContent())
      message.ack()
    })
  }

  async sendCreateBinanceAccount(accountId: number, apiKey: string, apiSecret: string): Promise<number> {
    const payload = { accountId, apiKey, apiSecret }

    if (!this._createBinanceAccountQueue) {
      throw new Error()
    }

    const op = await this._db.asyncOperation.create({
      data: { payload, opType: OperationType.CREATE_BINANCE_ACCOUNT }
    })

    const message = new Amqp.Message(JSON.stringify(payload), { persistent: true, correlationId: String(op.id) })

    this._createBinanceAccountQueue?.send(message)

    return op.id
  }

  async sendUpdateBinanceAccount(accountId: number, apiKey: string, apiSecret: string) {
  }

  async sendDeleteBinanceAccount() {

  }

}
