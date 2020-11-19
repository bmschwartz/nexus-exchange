import { BitmexCurrencyCreateInput, BitmexCurrencyUpdateInput, PrismaClient } from "@prisma/client"
import Bull, { JobInformation } from "bull";
import { Market, Ticker } from "ccxt";
import { bitmex as CcxtBitmex } from "ccxt.pro"

const LOAD_CURRENCY_JOB = "loadCurrencyJob"
const LOAD_CURRENCY_INTERVAL = 3600000 // ms

const FETCH_TICKERERS_JOB = "fetchTickersJob"
const FETCH_TICKERS_INTERVAL = 10000 // ms

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
  _fetchTickersQueue: Bull.Queue

  constructor(client: CcxtBitmex, prisma: PrismaClient) {
    this.client = client
    this.prisma = prisma

    this._loadMarketsQueue = new Bull("loadMarketsQueue")
    this._fetchTickersQueue = new Bull("fetchTickersQueue")

    this.setupQueues()
  }

  setupQueues() {
    this._loadMarketsQueue.process(LOAD_CURRENCY_JOB, _loadCurrencyData)
    this._fetchTickersQueue.process(FETCH_TICKERERS_JOB, _fetchTickers)
  }

  async start() {
    // On initial start, run this once
    await _loadCurrencyData()

    await this.setupJobs()
  }

  async setupJobs() {
    const loadMarketJobs: JobInformation[] = await this._loadMarketsQueue.getRepeatableJobs()
    const fetchTickersJobs: JobInformation[] = await this._fetchTickersQueue.getRepeatableJobs()

    loadMarketJobs.forEach(async (job: JobInformation) => {
      await this._loadMarketsQueue.removeRepeatableByKey(job.key)
    })
    fetchTickersJobs.forEach(async (job: JobInformation) => {
      await this._fetchTickersQueue.removeRepeatableByKey(job.key)
    })

    await this._loadMarketsQueue.add(LOAD_CURRENCY_JOB, {}, { repeat: { every: LOAD_CURRENCY_INTERVAL } })
    await this._fetchTickersQueue.add(FETCH_TICKERERS_JOB, {}, { repeat: { every: FETCH_TICKERS_INTERVAL } })
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

async function _fetchTickers() {
  const tickers = await _bitmexClient.client.fetchTickers()
  const upserts = Object.values(tickers)
    .filter((ticker: Ticker) => {
      return ticker.last !== undefined
    })
    .map((ticker: Ticker) => {
      return _bitmexClient.prisma.bitmexCurrency.update({
        data: { lastPrice: Number(ticker.last), markPrice: Number(ticker.info.markPrice) },
        where: { symbol: ticker.symbol }
      })
    })
  await _bitmexClient.prisma.$transaction(upserts)
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
