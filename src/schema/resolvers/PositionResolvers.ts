import {
  addStopToPositions,
  addTslToPositions,
  closePositions,
  getPosition,
  getPositionSide,
  getExchangeAccountPositions,
} from "../../repository/PositionRepository"
import { getExchangeAccount } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"

export const PositionQueries = {
  async position(parent: any, args: any, ctx: Context) {
    const {
      input: { id: positionId },
    } = args

    return getPosition(ctx, positionId)
  },

  async exchangeAccountPositions(parent: any, args: any, ctx: Context) {
    const {
      input: { exchangeAccountId, limit, offset },
    } = args

    return getExchangeAccountPositions(ctx, { exchangeAccountId, limit, offset })
  },
}

export const PositionResolvers = {
  async __resolveReference({ id: positionId }: any, args: any, ctx: Context) {
    return getPosition(ctx, positionId)
  },

  async side({ id: positionId }: any, args: any, ctx: Context) {
    return getPositionSide(ctx, positionId)
  },

  async membership(position: any, args: any, ctx: Context) {
    return {
      id: position.membershipId,
    }
  },

  async isOpen({ id: positionId }: any, args: any, ctx: Context) {
    const position = await getPosition(ctx, positionId)
    return position ? position.isOpen : false
  },

  async exchangeAccount(position: any, args: any, ctx: Context) {
    return getExchangeAccount(ctx, position.exchangeAccountId)
  },
}

export const PositionMutations = {
  async closePositions(parent: any, args: any, ctx: Context) {
    const { input: { exchangeAccountIds, symbol, price, percent } } = args

    return closePositions(ctx, { exchangeAccountIds: exchangeAccountIds.map(Number), symbol, price, percent })
  },

  async addStopToPositions(parent: any, args: any, ctx: Context) {
    console.log("add stop")
    const { input: { exchangeAccountIds, symbol, stopPrice, stopTriggerPriceType } } = args

    return addStopToPositions(ctx, { exchangeAccountIds: exchangeAccountIds.map(Number), symbol, stopPrice, stopTriggerPriceType })
  },

  async addTslToPositions(parent: any, args: any, ctx: Context) {
    console.log("add tsl")
    const { input: { exchangeAccountIds, symbol, tslPercent, stopTriggerPriceType } } = args

    return addTslToPositions(ctx, { exchangeAccountIds: exchangeAccountIds.map(Number), symbol, tslPercent, stopTriggerPriceType })
  }
}
