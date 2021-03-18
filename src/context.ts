import { PrismaClient } from "@prisma/client"
import { MessageClient } from "./services/messenger"
import { initSettings } from "./settings"

initSettings()

export const prisma: PrismaClient = new PrismaClient()
export const messenger = new MessageClient(prisma)

export interface Context {
  userId?: string
  userType?: string
  prisma: PrismaClient
  messenger: MessageClient
}

export function createContext({ req }: any): Context {
  let { userid: userId, usertype: userType } = req.headers

  userId = (userId !== "undefined" && userId !== undefined) ? userId : undefined
  userType = (userType !== "undefined" && userType !== undefined) ? userType : undefined

  return {
    prisma,
    userId,
    userType,
    messenger,
  }
}
