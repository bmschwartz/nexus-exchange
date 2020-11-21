import { BitmexCurrency } from "@prisma/client"
import { Context } from "src/context"

export const getTradableBitmexCurrencies = async (ctx: Context): Promise<BitmexCurrency[]> => {
  return ctx.prisma.bitmexCurrency.findMany({ where: { active: true } })
}

export const getBitmexCurrencyById = async (ctx: Context, id: number): Promise<BitmexCurrency | null> => {
  return ctx.prisma.bitmexCurrency.findOne({
    where: { id },
  })
}

export const getBitmexCurrency = async (ctx: Context, symbol: string): Promise<BitmexCurrency | null> => {
  return ctx.prisma.bitmexCurrency.findOne({ where: { symbol } })
}