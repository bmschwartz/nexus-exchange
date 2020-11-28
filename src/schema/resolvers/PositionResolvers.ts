import { closePositions, getPosition, getPositionSide } from "../../repository/PositionRepository"
import { getExchangeAccount } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"

export const PositionQueries = {
  async position(parent: any, args: any, ctx: Context) {
    const {
      input: { id: positionId },
    } = args

    return getPosition(ctx, Number(positionId))
  },
}

export const PositionResolvers = {
  async __resolveReference({ id: positionId }: any, args: any, ctx: Context) {
    return getPosition(ctx, positionId)
  },

  async side({ id: positionId }: any, args: any, ctx: Context) {
    return getPositionSide(ctx, positionId)
  },

  async membership(postition: any, args: any, ctx: Context) {
    return {
      id: postition.membershipId,
    }
  },

  async exchangeAccount(position: any, args: any, ctx: Context) {
    return getExchangeAccount(ctx, Number(position.exchangeAccountId))
  }
}

export const PositionMutations = {
  async closePositions(parent: any, args: any, ctx: Context) {
    const { input: { exchangeAccountIds, symbol } } = args

    return closePositions(ctx, { exchangeAccountIds: exchangeAccountIds.map(Number), symbol })
  },
}
