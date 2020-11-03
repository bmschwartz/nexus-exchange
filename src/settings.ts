import { exit } from "process"
import * as dotenv from "dotenv"

dotenv.config()

export const SETTINGS = {}

export function initSettings() {
  // RabbitMQ
  assignEnvVar("AMQP_URL", process.env.AMQP_URL)

  // RabbitMQ - Binance
  assignEnvVar("BINANCE_EXCHANGE", process.env.BINANCE_EXCHANGE)

  assignEnvVar("BINANCE_CREATE_ACCOUNT_QUEUE", process.env.BINANCE_CREATE_ACCOUNT_QUEUE)
  assignEnvVar("BINANCE_ACCOUNT_CREATED_QUEUE", process.env.BINANCE_ACCOUNT_CREATED_QUEUE)
  assignEnvVar("BINANCE_CREATE_ACCOUNT_CMD_KEY", process.env.BINANCE_CREATE_ACCOUNT_CMD_KEY)
  assignEnvVar("BINANCE_EVENT_ACCOUNT_CREATED_KEY", process.env.BINANCE_EVENT_ACCOUNT_CREATED_KEY)

  assignEnvVar("BINANCE_ACCOUNT_UPDATED_QUEUE", process.env.BINANCE_ACCOUNT_UPDATED_QUEUE)
  assignEnvVar("BINANCE_EVENT_ACCOUNT_UPDATED_KEY", process.env.BINANCE_EVENT_ACCOUNT_UPDATED_KEY)
  assignEnvVar("BINANCE_UPDATE_ACCOUNT_CMD_KEY_PREFIX", process.env.BINANCE_UPDATE_ACCOUNT_CMD_KEY_PREFIX)

  assignEnvVar("BINANCE_ACCOUNT_DELETED_QUEUE", process.env.BINANCE_ACCOUNT_DELETED_QUEUE)
  assignEnvVar("BINANCE_EVENT_ACCOUNT_DELETED_KEY", process.env.BINANCE_EVENT_ACCOUNT_DELETED_KEY)
  assignEnvVar("BINANCE_DELETE_ACCOUNT_CMD_KEY_PREFIX", process.env.BINANCE_DELETE_ACCOUNT_CMD_KEY_PREFIX)

  // RabbitMQ - Bitmex
  assignEnvVar("BITMEX_EXCHANGE", process.env.BITMEX_EXCHANGE)

  assignEnvVar("BITMEX_CREATE_ACCOUNT_QUEUE", process.env.BITMEX_CREATE_ACCOUNT_QUEUE)
  assignEnvVar("BITMEX_ACCOUNT_CREATED_QUEUE", process.env.BITMEX_ACCOUNT_CREATED_QUEUE)
  assignEnvVar("BITMEX_CREATE_ACCOUNT_CMD_KEY", process.env.BITMEX_CREATE_ACCOUNT_CMD_KEY)
  assignEnvVar("BITMEX_EVENT_ACCOUNT_CREATED_KEY", process.env.BITMEX_EVENT_ACCOUNT_CREATED_KEY)

  assignEnvVar("BITMEX_ACCOUNT_UPDATED_QUEUE", process.env.BITMEX_ACCOUNT_UPDATED_QUEUE)
  assignEnvVar("BITMEX_EVENT_ACCOUNT_UPDATED_KEY", process.env.BITMEX_EVENT_ACCOUNT_UPDATED_KEY)
  assignEnvVar("BITMEX_UPDATE_ACCOUNT_CMD_KEY_PREFIX", process.env.BITMEX_UPDATE_ACCOUNT_CMD_KEY_PREFIX)

  assignEnvVar("BITMEX_ACCOUNT_DELETED_QUEUE", process.env.BITMEX_ACCOUNT_DELETED_QUEUE)
  assignEnvVar("BITMEX_EVENT_ACCOUNT_DELETED_KEY", process.env.BITMEX_EVENT_ACCOUNT_DELETED_KEY)
  assignEnvVar("BITMEX_DELETE_ACCOUNT_CMD_KEY_PREFIX", process.env.BITMEX_DELETE_ACCOUNT_CMD_KEY_PREFIX)
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
