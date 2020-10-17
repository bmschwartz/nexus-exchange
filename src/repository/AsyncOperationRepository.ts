import { AsyncOperation } from "@prisma/client"
import { Context } from "src/context"

export const getAsyncOperation = async (ctx: Context, id: number): Promise<AsyncOperation | null> => {
  const op = await ctx.prisma.asyncOperation.findOne({
    where: { id }
  })
  return op?.userId === ctx.userId ? op : null
}