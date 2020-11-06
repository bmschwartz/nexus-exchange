import { AsyncOperation, OperationType, PrismaClient } from "@prisma/client"
import { Context } from "../context"

export const getAsyncOperation = async (ctx: Context, id: string): Promise<AsyncOperation | null> => {
  return ctx.prisma.asyncOperation.findOne({
    where: { id: parseInt(id) }
  })
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

export const getPendingAccountOperations = async (prisma: PrismaClient, accountId: number): Promise<AsyncOperation[] | null> => {
  const query = `
  SELECT * FROM "AsyncOperation"
  WHERE
    payload -> 'accountId' = '${accountId}' AND
    complete = false;`
  return prisma.$queryRaw(query)
}
