import { AsyncOperation } from "@prisma/client"
import { Context } from "src/context"

export const getAsyncOperation = async (ctx: Context, id: number): Promise<AsyncOperation | null> => {
  return ctx.prisma.asyncOperation.findOne({
    where: { id }
  })
}