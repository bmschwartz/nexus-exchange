import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Context {
  userId?: number
  permissions: string[]
  prisma: PrismaClient
}

export function createContext({ req }: any): Context {
  let { userid, permissions } = req.headers

  const userId = userid !== 'undefined' ? Number(userid) : undefined
  permissions = permissions !== 'undefined' ? JSON.parse(permissions) : []

  return {
    prisma,
    userId,
    permissions,
  }
}
