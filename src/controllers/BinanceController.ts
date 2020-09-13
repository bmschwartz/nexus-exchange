import { BinanceCurrency } from "@prisma/client"
import { Context } from "src/context"

export const getBinanceCurrencies = async (ctx: Context): Promise<BinanceCurrency[]> => {
    return ctx.prisma.binanceCurrency.findMany()
}

export const getBinanceCurrency = async (ctx: Context, id: number): Promise<BinanceCurrency | null> => {
    return ctx.prisma.binanceCurrency.findOne({
        where: { id },
    })
}