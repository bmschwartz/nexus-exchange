import { Exchange, Position, PositionSide } from "@prisma/client";
import { Context } from "src/context";
import { getAllSettledResults } from "../helper";

export interface MemberPositionsInput {
  membershipId: number
  limit?: number
  offset?: number
}

export interface MemberPositionsResult {
  totalCount: number
  positions: Position[]
}

export interface ClosePositionsInput {
  symbol: string
  price: number
  fraction: number
  exchangeAccountIds: number[]
}

export interface ClosePositionsResult {
  positionIds: number[]
}

export const getPosition = async (ctx: Context, positionId: number) => {
  return ctx.prisma.position.findUnique({ where: { id: positionId } })
}

export const getPositionSide = async (ctx: Context, positionId: number) => {
  const position = await ctx.prisma.position.findUnique({ where: { id: positionId } })
  return position && position.side
}

export const createPosition = async (
  ctx: Context,
  exchangeAccountId: number,
  side: PositionSide,
  exchange: Exchange,
  symbol: string,
  avgPrice?: number | null,
  isOpen?: boolean | null,
  quantity?: number | null,
  leverage?: number | null,
  markPrice?: number | null,
  margin?: number | null,
  maintenanceMargin?: number | null,
) => {
  return ctx.prisma.position.create({
    data: {
      exchange,
      side,
      symbol,
      avgPrice,
      isOpen: isOpen || false,
      quantity,
      leverage,
      markPrice,
      margin,
      maintenanceMargin,
      exchangeAccount: { connect: { id: exchangeAccountId } },
    }
  })
}

export const getMemberPositions = async (ctx: Context, { membershipId, limit, offset }: MemberPositionsInput): Promise<MemberPositionsResult | Error> => {
  const exchangeAccounts = await ctx.prisma.exchangeAccount.findMany({
    where: { membershipId }
  })

  if (!exchangeAccounts) {
    return new Error("Can't find exchanges for this membership")
  }

  const accountIds = exchangeAccounts.map(account => account.id)

  const positions: Position[] = await ctx.prisma.position.findMany({
    take: limit,
    skip: offset,
    where: { exchangeAccountId: { in: accountIds } },
    orderBy: { createdAt: "desc" },
  })
  const totalCount = await ctx.prisma.position.count({
    where: { exchangeAccountId: { in: accountIds } },
  })

  return {
    positions,
    totalCount
  }
}

export const closePositions = async (ctx: Context, { exchangeAccountIds, symbol, price, fraction }: ClosePositionsInput): Promise<any> => {
  console.log(`Close position of ${symbol} on ${exchangeAccountIds.length} accounts`)

  const ops: any[] = getAllSettledResults(await Promise.allSettled(
    exchangeAccountIds.map(async (exchangeAccountId: number) => {
      const exchangeAccount = await ctx.prisma.exchangeAccount.findUnique({ where: { id: exchangeAccountId } })
      if (!exchangeAccount) {
        return {
          error: "No exchange account found"
        }
      }

      let opId: number
      try {
        switch (exchangeAccount.exchange) {
          case Exchange.BINANCE:
            return {
              error: "Bitmex close order not implemented"
            }
          case Exchange.BITMEX:
            console.log("closing bitmex")
            opId = await ctx.messenger.sendCloseBitmexPosition(exchangeAccount.id, { symbol, price, fraction })
            break
        }
      } catch {
        return {
          error: "Unable to connect to exchange"
        }
      }
      return {
        operationId: opId
      }
    })
  ))
  console.log(ops)
  return ops
}