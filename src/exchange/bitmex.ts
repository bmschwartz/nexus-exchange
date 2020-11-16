import { BitmexCurrencyCreateInput, BitmexCurrencyUpdateInput, PrismaClient } from "@prisma/client"
import Bull, { Job, JobInformation } from "bull";
import { Market } from "ccxt";
import { bitmex as CcxtBitmex } from "ccxt.pro"

const LOAD_CURRENCY_JOB = "loadCurrencyJob"
const LOAD_CURRENCY_INTERVAL = 10000 // ms

let _bitmexClient: BitmexClient

interface BitmexCurrencyUpsertData {
  create: BitmexCurrencyCreateInput
  update: BitmexCurrencyUpdateInput
}

export async function initBitmex(prisma: PrismaClient) {
  _bitmexClient = new BitmexClient(new CcxtBitmex(), prisma)
  await _bitmexClient.start()
}

class BitmexClient {
  client: CcxtBitmex
  prisma: PrismaClient
  _loadMarketsQueue: Bull.Queue

  constructor(client: CcxtBitmex, prisma: PrismaClient) {
    this.client = client
    this.prisma = prisma

    this._loadMarketsQueue = new Bull("loadMarketsQueue")
    this._loadMarketsQueue.process(LOAD_CURRENCY_JOB, _loadCurrencyData)
  }

  async start() {
    const jobs: JobInformation[] = await this._loadMarketsQueue.getRepeatableJobs()
    jobs.forEach(async (job: JobInformation) => {
      await this._loadMarketsQueue.removeRepeatableByKey(job.key)
    })

    await this._loadMarketsQueue.add(LOAD_CURRENCY_JOB, {}, { repeat: { every: LOAD_CURRENCY_INTERVAL } })
  }
}

async function _loadCurrencyData() {
  console.log("loading...")
  const allMarkets = await _bitmexClient.client.loadMarkets()

  const upserts = Object.values(allMarkets).map((market: Market) => {
    const data = createMarketData(market)
    return _bitmexClient.prisma.bitmexCurrency.upsert({
      create: data.create,
      update: data.update,
      where: { symbol: String(data.update.symbol) }
    })
  })

  await _bitmexClient.prisma.$transaction(upserts)
  console.log("upserted")
}

function createMarketData(market: Market): BitmexCurrencyUpsertData {
  const { symbol, underlying, quoteCurrency, lastPrice, markPrice, tickSize } = market.info
  const fractionalDigits = 0

  const symbolData = { symbol, underlying, quoteCurrency, active: market.active, lastPrice, markPrice, tickSize, fractionalDigits }

  return {
    create: symbolData,
    update: symbolData,
  }
}