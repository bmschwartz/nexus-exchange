import { Exchange, Position, PositionSide } from "@prisma/client";
import { Context } from "src/context";

export interface MemberPositionsInput {
  membershipId: number
  limit?: number
  offset?: number
}

export interface MemberPositionsResult {
  totalCount: number
  positions: Position[]
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
) => {
  return ctx.prisma.position.create({
    data: {
      exchange,
      side,
      symbol,
      avgPrice,
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