import { Exchange, ExchangeAccount, OperationType, PrismaClient } from "@prisma/client";
import Bull, { Job } from "bull";
import { SETTINGS } from "../settings";
import { getAllSettledResults } from "../helper";
import { validateApiKeyAndSecret } from "../repository/ExchangeAccountRepository";
import { MessageClient } from "./messenger";
import {logger} from "../logger";

let _db: PrismaClient
let _messenger: MessageClient

const CHECK_ACCOUNT_JOB = "checkAccountJob"
const CHECK_ACCOUNT_INTERVAL = 10 * 1000 // ms

const HEARTBEAT_TIMEOUT = 2 * 60 * 1000 // ms

async function _checkAccountLife(job: Job) {
  const timeoutDate = new Date(Date.now() - HEARTBEAT_TIMEOUT)
  const timedOutAccounts = await _db.exchangeAccount.findMany({
    where: { active: true, lastHeartbeat: { lt: timeoutDate } },
  })

  getAllSettledResults(await Promise.allSettled(
    timedOutAccounts
      .map(recreateAccount)
      .filter(Boolean),
  ))
}

async function recreateAccount({ id: accountId, exchange, apiKey, apiSecret }: ExchangeAccount): Promise<string | undefined> {
  let opType: OperationType
  switch (exchange) {
    case Exchange.BITMEX:
      opType = OperationType.CREATE_BITMEX_ACCOUNT
      break
    case Exchange.BINANCE:
      opType = OperationType.CREATE_BINANCE_ACCOUNT
      break
  }

  const query = `
  SELECT count(*) FROM "AsyncOperation"
  WHERE
    "opType" = '${opType}' AND
    payload ->> 'accountId' = '${accountId}' AND
    complete = false;`
  const pendingCreateOpCount = await _db.$queryRaw(query)

  if (!pendingCreateOpCount || pendingCreateOpCount[0]["count"] > 0) {
    return
  }

  if (!apiKey || !apiSecret) {
    return
  }

  const isValidApiKeyAndSecret = await validateApiKeyAndSecret(exchange, apiKey, apiSecret)
  if (!isValidApiKeyAndSecret) {
    logger.info({ message: `Invalid API keys [${accountId} for ${exchange}]`})
    await _db.exchangeAccount.update({ where: { id: accountId }, data: { active: false, updatedAt: new Date() } })
    return
  }

  logger.info({ message: "Sending create account", accountId, exchange })

  try {
    switch (exchange) {
      case Exchange.BITMEX:
        return _messenger.sendCreateBitmexAccount(accountId, apiKey, apiSecret)
      case Exchange.BINANCE:
        return _messenger.sendCreateBinanceAccount(accountId, apiKey, apiSecret)
    }
  } catch (e) {
    logger.info({ message: "Send create account error", accountId })
  }

  return
}

export class AccountMonitor {
  _accountMonitorQueue: Bull.Queue

  constructor(prisma: PrismaClient, messenger: MessageClient) {
    _db = prisma
    _messenger = messenger

    this._accountMonitorQueue = new Bull(
      "accountMonitorQueue",
      SETTINGS["REDIS_URL"],
      { defaultJobOptions: { removeOnComplete: true, removeOnFail: true } },
    )

    // give heartbeats a chance to roll in before checking to see if they have expired
    setTimeout(() => {
      this._accountMonitorQueue.process(CHECK_ACCOUNT_JOB, _checkAccountLife)
    }, 1000 * 60)
  }

  async start() {
    await this._accountMonitorQueue.empty()
    await this._accountMonitorQueue.add(CHECK_ACCOUNT_JOB, {}, { repeat: { every: CHECK_ACCOUNT_INTERVAL } })
  }
}
