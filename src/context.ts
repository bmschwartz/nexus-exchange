import { exit } from "process";

import * as dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { RedisClient, SQSClient } from "./services"

dotenv.config()

const redisHost = process.env.REDIS_CLUSTER_HOST
const redisPort = process.env.REDIS_CLUSTER_PORT

const accessKey = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const awsRegion = process.env.AWS_DEFAULT_REGION
const createAccountQueue = process.env.BINANCE_CREATE_ACCOUNT_QUEUE
const createAccountResultQueue = process.env.BINANCE_CREATE_ACCOUNT_RESULT_QUEUE

if (!redisHost || !redisPort) {
  console.error("Redis variables missing!")
  exit(1)
}

if (!awsRegion) {
  console.error("AWS variables not found!")
  exit(1)
}
if (!createAccountQueue || !createAccountResultQueue) {
  console.error("Queues missing!")
  exit(1)
}
if (!accessKey || !secretAccessKey) {
  console.error("AWS Keys not specified!")
  exit(1)
}

export const prisma = new PrismaClient()
export const redis = new RedisClient(redisHost, redisPort)
export const sqs = new SQSClient({
  accessKey,
  secretKey: secretAccessKey,
  awsRegion,
  createAccountQueue,
  createAccountResultQueue,
})

export interface Context {
  userId?: number
  permissions: string[]
  prisma: PrismaClient
  sqs: SQSClient
  redis: RedisClient
}

export function createContext({ req }: any): Context {
  let { userid: userId, permissions } = req.headers

  userId = userId !== "undefined" ? Number(userId) : undefined
  permissions = permissions !== "undefined" ? JSON.parse(permissions) : []

  return {
    sqs,
    redis,
    prisma,
    userId,
    permissions,
  }
}
