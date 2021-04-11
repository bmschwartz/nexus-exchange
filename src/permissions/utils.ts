import * as jwt from "jsonwebtoken"
import { rule } from "graphql-shield";

import { logger } from "../logger";

export const isAuthenticated = rule()((parent, args, { userId }) => {
  return !!userId
})

export const parsePermissionToken = (token: string) => {
  try {
    const verifyData: any = jwt.verify(token, String(process.env.APP_SECRET), { complete: true })
    const { payload } = verifyData
    if (!payload) {
      return null
    }

    const { groupId, active, role, status, membershipId } = payload
    return { groupId, active, role, status, membershipId }
  } catch (e) {
    logger.info({ message: "Invalid permission token" })
    return null
  }
}
