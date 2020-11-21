import { Exchange, ExchangeAccount, OperationType, PrismaClient } from "@prisma/client";
import Bull, { Job, JobInformation } from "bull";
import { validateApiKeyAndSecret } from "../repository/ExchangeAccountRepository";
import { MessageClient } from "./messenger";

let _db: PrismaClient
let _messenger: MessageClient

const CHECK_ACCOUNT_JOB = "checkAccountJob"
const CHECK_ACCOUNT_INTERVAL = 5000 // ms

const HEARTBEAT_TIMEOUT = 20000 // ms

async function _checkAccountLife(job: Job) {
  const timeoutDate = new Date(Date.now() - HEARTBEAT_TIMEOUT)
  const timedOutAccounts = await _db.exchangeAccount.findMany({
    where: { active: true, lastHeartbeat: { lt: timeoutDate } }
  })

  const unresolvedAccountLifeChecks = await Promise.allSettled(timedOutAccounts.map(recreateAccount))
  return unresolvedAccountLifeChecks.map(result => result.status ? "fufilled" : null).filter(Boolean)
}

async function recreateAccount({ id: accountId, exchange, apiKey, apiSecret }: ExchangeAccount) {
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
    payload -> 'accountId' = '${accountId}' AND
    complete = false;`
  const pendingCreateOpCount = await _db.$queryRaw(query)

  if (!pendingCreateOpCount || pendingCreateOpCount[0]["count"] > 0) {
    return
  }

  const isValidApiKeyAndSecret = await validateApiKeyAndSecret(exchange, apiKey, apiSecret)
  if (!isValidApiKeyAndSecret) {
    return _db.exchangeAccount.update({ where: { id: accountId }, data: { active: false } })
  }

  try {
    switch (exchange) {
      case Exchange.BITMEX:
        return _messenger.sendCreateBitmexAccount(accountId, apiKey, apiSecret)
      case Exchange.BINANCE:
        return _messenger.sendCreateBinanceAccount(accountId, apiKey, apiSecret)
    }
  } catch {
    return _db.exchangeAccount.delete({ where: { id: accountId } })
  }
}

export class AccountMonitor {
  _accountMonitorQueue: Bull.Queue

  constructor(prisma: PrismaClient, messenger: MessageClient) {
    _db = prisma
    _messenger = messenger

    this._accountMonitorQueue = new Bull("accountMonitorQueue")
    this._accountMonitorQueue.process(CHECK_ACCOUNT_JOB, _checkAccountLife)

    this._start()
  }

  async _start() {
    const jobs: JobInformation[] = await this._accountMonitorQueue.getRepeatableJobs()
    jobs.forEach(async (job: JobInformation) => {
      await this._accountMonitorQueue.removeRepeatableByKey(job.key)
    })

    await this._accountMonitorQueue.add(CHECK_ACCOUNT_JOB, {}, { repeat: { every: CHECK_ACCOUNT_INTERVAL } })
  }
}