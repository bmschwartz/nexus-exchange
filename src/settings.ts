import { exit } from "process"
import * as dotenv from "dotenv"

dotenv.config()

export const SETTINGS = {}

export function initSettings() {
  // RabbitMQ
  assignEnvVar("AMQP_URL", process.env.AMQP_URL)

  // RabbitMQ - Binance
  assignEnvVar("BINANCE_EXCHANGE", process.env.BINANCE_EXCHANGE)

  assignEnvVar("CREATE_BINANCE_ACCOUNT_QUEUE", process.env.CREATE_BINANCE_ACCOUNT_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_CREATED_QUEUE", process.env.BINANCE_ACCOUNT_CREATED_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_CREATED_EVENT_KEY", process.env.BINANCE_ACCOUNT_CREATED_EVENT_KEY)

  assignEnvVar("UPDATE_BINANCE_ACCOUNT_QUEUE", process.env.UPDATE_BINANCE_ACCOUNT_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_UPDATED_QUEUE", process.env.BINANCE_ACCOUNT_UPDATED_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_UPDATED_EVENT_KEY", process.env.BINANCE_ACCOUNT_UPDATED_EVENT_KEY)

  assignEnvVar("DELETE_BINANCE_ACCOUNT_QUEUE", process.env.DELETE_BINANCE_ACCOUNT_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_DELETED_QUEUE", process.env.BINANCE_ACCOUNT_DELETED_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_DELETED_EVENT_KEY", process.env.BINANCE_ACCOUNT_DELETED_EVENT_KEY)
}

function assignEnvVar(name: string, envKey?: any) {
  const value: string | undefined = envKey
  if (!value) {
    console.error(`Missing ${name}!`)
    exit(1)
  } else {
    SETTINGS[name] = value
  }
}
