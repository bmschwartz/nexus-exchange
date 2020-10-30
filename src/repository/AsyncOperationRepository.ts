import { AsyncOperation, OperationType, PrismaClient } from "@prisma/client"
import { Context, prisma } from "../context"

export const getAsyncOperation = async (ctx: Context, id: string): Promise<AsyncOperation | null> => {
  const op = await ctx.prisma.asyncOperation.findOne({
    where: { id: parseInt(id) }
  })
  return op?.userId === ctx.userId ? op : null
}

export const createAsyncOperation = async (prisma: PrismaClient, data: any, opType: OperationType): Promise<AsyncOperation | null> => {
  return prisma.asyncOperation.create({
    data: { ...data, opType }
  })
}

export const completeAsyncOperation = async (prisma: PrismaClient, id: string, success: boolean, error?: string): Promise<AsyncOperation | null> => {
  return prisma.asyncOperation.update({
    where: { id: parseInt(id) },
    data: {
      complete: true,
      success,
      error,
    }
  })
}

export const getPendingBinanceAccountOperations = async (prisma: PrismaClient, accountId: number): Promise<AsyncOperation[] | null> => {
  const query = `
  SELECT * FROM "AsyncOperation"
  WHERE
    payload -> 'accountId' = '${accountId}' AND
    complete = false;`
  return prisma.$queryRaw(query)
}
