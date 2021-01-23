import { AsyncOperation, OperationType, PrismaClient } from "@prisma/client"
import { Context } from "../context"

export const getAsyncOperation = async (ctx: Context, id: string): Promise<AsyncOperation | null> => {
  return ctx.prisma.asyncOperation.findUnique({
    where: { id }
  })
}

export const createAsyncOperation = async (prisma: PrismaClient, data: any, opType: OperationType): Promise<AsyncOperation | null> => {
  return prisma.asyncOperation.create({
    data: { ...data, opType }
  })
}

export const completeAsyncOperation = async (prisma: PrismaClient, id: string, success: boolean, error?: string): Promise<AsyncOperation | null> => {
  const exists = await prisma.asyncOperation.count({ where: { id } })

  if (!exists) {
    return null
  }

  return prisma.asyncOperation.update({
    where: { id },
    data: {
      complete: true,
      success,
      error,
    }
  })
}

export const getPendingAccountOperations = async (prisma: PrismaClient, accountId: string): Promise<AsyncOperation[] | null> => {
  const query = `
  SELECT * FROM "AsyncOperation"
  WHERE
    payload -> 'accountId' = '${accountId}' AND
    complete = false;`
  return prisma.$queryRaw(query)
}
