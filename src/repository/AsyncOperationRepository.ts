import { AsyncOperation, OperationType, PrismaClient } from "@prisma/client"
import { Context } from "../context"

export const getAsyncOperation = async (ctx: Context, id: string): Promise<AsyncOperation | null> => {
  return ctx.prisma.asyncOperation.findUnique({
    where: { id },
  })
}

export const createAsyncOperation = async (prisma: PrismaClient, data: any, opType: OperationType): Promise<AsyncOperation | null> => {
  return prisma.asyncOperation.create({
    data: { ...data, opType },
  })
}

export const completeAsyncOperation = async (prisma: PrismaClient, id: string, success: boolean, errors?: string[] | object): Promise<AsyncOperation | null> => {
  const exists = await prisma.asyncOperation.count({ where: { id } })

  if (!exists) {
    return null
  }

  let errorString
  const errorSeparator = " - "
  if (Array.isArray(errors)) {
    errorString = errors.join(errorSeparator)
  } else if (typeof errors === "object") {
    errorString = Object.entries(errors).map(entry => `${entry[0]}: ${entry[1]}`).join(errorSeparator)
  }

  return prisma.asyncOperation.update({
    where: { id },
    data: {
      complete: true,
      success,
      error: errorString,
    },
  })
}

export const getPendingAccountOperations = async (prisma: PrismaClient, accountId: string): Promise<AsyncOperation[] | null> => {
  const query = `
  SELECT * FROM "AsyncOperation"
  WHERE
    payload ->> 'accountId' = '${accountId}' AND
    complete = false;`
  return prisma.$queryRaw(query)
}

export const getPendingDeleteAccountOperations = async (prisma: PrismaClient, accountId: string): Promise<AsyncOperation[] | null> => {
  const query = `
  SELECT * FROM "AsyncOperation"
  WHERE
    ("opType" = 'DELETE_BITMEX_ACCOUNT' OR "opType" = 'DELETE_BINANCE_ACCOUNT') AND
    payload ->> 'accountId' = '${accountId}' AND
    complete = false;`
  return prisma.$queryRaw(query)
}
