import { PrismaClient } from "@prisma/client"
import { AccountMonitor } from "./services/accountMonitor"
import { MessageClient } from "./services/messenger"
import { initSettings } from "./settings"

initSettings()

export const prisma: PrismaClient = new PrismaClient()
export const messenger = new MessageClient(prisma)
export const accountMonitor = new AccountMonitor(prisma, messenger)

export interface Context {
  userId?: string
  prisma: PrismaClient
  messenger: MessageClient
  accountMonitor: AccountMonitor
}

export function createContext({ req }: any): Context {
  let { userid: userId } = req.headers

  userId = (userId !== "undefined" && userId !== undefined) ? userId : undefined

  return {
    prisma,
    userId,
    messenger,
    accountMonitor,
  }
}
