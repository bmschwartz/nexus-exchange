import { BitmexCurrencyCreateInput, BitmexCurrencyUpdateInput, PrismaClient } from "@prisma/client"
import Bull, { JobInformation } from "bull";
import { Market } from "ccxt";
import { bitmex as CcxtBitmex } from "ccxt.pro"

const LOAD_CURRENCY_JOB = "loadCurrencyJob"
const LOAD_CURRENCY_INTERVAL = 3600000 // ms

const UPDATE_PRICES_JOB = "updatePricesJob"
const UPDATE_PRICES_INTERVAL = 10000 // ms

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
  _updatePricesQueue: Bull.Queue

  constructor(client: CcxtBitmex, prisma: PrismaClient) {
    this.client = client
    this.prisma = prisma

    this._loadMarketsQueue = new Bull("loadMarketsQueue")
    this._updatePricesQueue = new Bull("updatePricesQueue")

    this.setupQueues()
  }

  setupQueues() {
    this._loadMarketsQueue.process(LOAD_CURRENCY_JOB, _loadCurrencyData)
    this._updatePricesQueue.process(UPDATE_PRICES_JOB, _updatePrices)
  }

  async start() {
    // On initial start, run this once
    await _loadCurrencyData()

    await this.setupJobs()
  }

  async setupJobs() {
    const loadMarketJobs: JobInformation[] = await this._loadMarketsQueue.getRepeatableJobs()
    const updatePricesJobs: JobInformation[] = await this._updatePricesQueue.getRepeatableJobs()

    loadMarketJobs.forEach(async (job: JobInformation) => {
      await this._loadMarketsQueue.removeRepeatableByKey(job.key)
    })
    updatePricesJobs.forEach(async (job: JobInformation) => {
      await this._updatePricesQueue.removeRepeatableByKey(job.key)
    })

    await this._loadMarketsQueue.add(LOAD_CURRENCY_JOB, {}, { repeat: { every: LOAD_CURRENCY_INTERVAL } })
    await this._updatePricesQueue.add(UPDATE_PRICES_JOB, {}, { repeat: { every: UPDATE_PRICES_INTERVAL } })
  }
}

async function _loadCurrencyData() {
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
}

async function _updatePrices() {
  _bitmexClient.client.watchTickers()
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