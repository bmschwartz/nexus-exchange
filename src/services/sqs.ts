import * as dotenv from "dotenv"
import { v4 as uuid4 } from "uuid";

import { SQS, Credentials } from "aws-sdk";
import { SendMessageBatchResultEntryList } from "aws-sdk/clients/sqs";
import { Producer } from "sqs-producer";

dotenv.config()

export interface SQSClientOptions {
  accessKey: string
  secretKey: string
  awsRegion: string
  createAccountQueue: string
}

export class SQSClient {
  _accessKey: string
  _secretKey: string
  _createAccountProducer: Producer

  constructor(options: SQSClientOptions) {
    const { accessKey, secretKey, createAccountQueue, awsRegion } = options

    this._accessKey = accessKey
    this._secretKey = secretKey

    this._createAccountProducer = Producer.create({
      queueUrl: createAccountQueue,
      region: awsRegion,
      sqs: new SQS({
        region: awsRegion,
        credentials: new Credentials({
          accessKeyId: this._accessKey,
          secretAccessKey: this._secretKey,
        }),
      }),
    })
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

}
