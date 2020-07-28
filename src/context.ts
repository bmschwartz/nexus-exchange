import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Context {
  userId?: number
  prisma: PrismaClient
}

export function createContext({ req }: any): Context {
  const { userid: userId } = req.headers
  return {
    prisma,
    userId: Number(userId),
  }
}