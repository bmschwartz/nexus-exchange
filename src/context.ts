import { PrismaClient } from "@prisma/client"
import { MessageClient } from "./services/messenger"
import { initSettings } from "./settings"


initSettings()


export const prisma = new PrismaClient()
export const messenger = new MessageClient(prisma)

export interface Context {
  userId?: number
  permissions: string[]
  prisma: PrismaClient
  messenger: MessageClient
}

export function createContext({ req }: any): Context {
  let { userid: userId, permissions } = req.headers

  userId = userId !== "undefined" ? Number(userId) : undefined
  permissions = permissions !== "undefined" ? JSON.parse(permissions) : []

  return {
    prisma,
    userId,
    messenger,
    permissions,
  }
}
