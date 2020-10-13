import * as dotenv from "dotenv"
import { v4 as uuid4 } from "uuid";

import AWS, { SQS, Credentials } from "aws-sdk";
import { SendMessageBatchResultEntryList } from "aws-sdk/clients/sqs";
import { Producer } from "sqs-producer";
import { Consumer } from "sqs-consumer";

import { redis } from "../context";

dotenv.config()

export interface SQSClientOptions {
  accessKey: string
  secretKey: string
  awsRegion: string
  createAccountQueue: string
  createAccountResultQueue: string
}

export class SQSClient {
  _createAccountProducer: Producer
  _createAccountResultConsumer: Consumer

  constructor(options: SQSClientOptions) {
    const { accessKey, secretKey, createAccountQueue, awsRegion, createAccountResultQueue } = options

    AWS.config.update({
      region: awsRegion,
      credentials: new Credentials(accessKey, secretKey)
    })

    this._createAccountProducer = Producer.create({
      sqs: new AWS.SQS(),
      queueUrl: createAccountQueue,
    })

    this._createAccountResultConsumer = Consumer.create({
      sqs: new AWS.SQS(),
      queueUrl: createAccountResultQueue,
      handleMessage: this.handleCreateAccountResultMessage,
    })
    this._createAccountResultConsumer.start()
  }

  async sendCreateAccountMessage(accountId: number, payload: object): Promise<string | undefined> {
    const body = JSON.stringify(payload)

    const result: SendMessageBatchResultEntryList = await this._createAccountProducer.send({
      id: uuid4(),
      body,
      groupId: String(accountId),
      deduplicationId: uuid4(),
    })

    if (!result || result.length === 0) {
      return
    }

    return result[0].MessageId
  }

  async handleCreateAccountResultMessage(message: SQS.Types.Message) {
    const { Body: body } = message
    if (!body) {
      return
    }

    const resultData = JSON.parse(body)
    const { sourceMessageId, success, error } = resultData

    const redisData = await redis.get(sourceMessageId)

    if (!redisData) {
      console.error(`Redis -- No data for create account operation ${sourceMessageId}!!!`)
      return
    }

    const currentData = JSON.parse(redisData)
    currentData.complete = true
    currentData.success = success
    currentData.error = error

    await redis.set(sourceMessageId, JSON.stringify(currentData))
  }
}
