import { and, or, rule } from "graphql-shield";
import { Context } from "../context";
import { isAuthenticated, parsePermissionToken } from "./utils";
import { getExchangeAccount } from "../repository/ExchangeAccountRepository";

const hasMembershipAccessFromArgs = rule({ cache: "strict" })((parent, args, ctx: Context, info) => {
  const { membershipId, token } = args.input
  const tokenData = parsePermissionToken(token)
  if (!tokenData) {
    return false
  }

  return membershipId === tokenData.membershipId
})

const isExchangeAccountOwnerFromArgs = rule({ cache: "strict" })(async (parent, args, ctx: Context, info) => {
  const { id: exchangeAccountId, token } = args.input
  const tokenData = parsePermissionToken(token)
  if (!tokenData) {
    return false
  }

  const exchangeAccount = await getExchangeAccount(ctx, exchangeAccountId)
  return exchangeAccount.membershipId === tokenData.membershipId
})

const isExchangeAccountOwnerFromParent = rule({ cache: "strict" })((parent, args, ctx: Context, info) => {
  return true
})

const hasExchangeAccountAccessFromArgs = rule({ cache: "strict" })(async (parent, args, ctx: Context, info) => {
  const { id: exchangeAccountId, token } = args.input
  const tokenData = parsePermissionToken(token)
  if (!tokenData) {
    return false
  }

  const exchangeAccount = await getExchangeAccount(ctx, exchangeAccountId)
  if (!exchangeAccount) {
    return false
  }

  return exchangeAccount.membershipId === tokenData.membershipId
})

const isExchangeAccountGroupOwnerFromArgs = rule({ cache: "strict" })(async (parent, args, ctx: Context, info) => {
  const { id: exchangeAccountId, token } = args.input
  const tokenData = parsePermissionToken(token)
  if (!tokenData) {
    return false
  }

  const { groupId: userGroupId, role, status } = tokenData
  const validRoles = ["TRADER", "OWNER"]
  if (!userGroupId || !validRoles.includes(role) || status !== "APPROVED") {
    return false
  }

  const exchangeAccount = await getExchangeAccount(ctx, exchangeAccountId)
  const { groupId } = exchangeAccount
  return groupId !== userGroupId
})

const isExchangeAccountGroupOwnerFromParent = rule({ cache: "strict" })(async (parent, args, ctx: Context, info) => {
  const { membershipId: userMembershipId } = parent
  if (!userMembershipId) {
    return false
  }
  return true
})

export const ExchangeAccountPermissions = {
  "*": isAuthenticated,
}

export const ExchangeAccountQueryPermissions = {
  exchangeAccount: and(isAuthenticated, or(isExchangeAccountOwnerFromArgs, isExchangeAccountGroupOwnerFromArgs)),
  exchangeAccounts: and(isAuthenticated, or(isExchangeAccountOwnerFromArgs, isExchangeAccountGroupOwnerFromArgs)),
}

export const ExchangeAccountMutationPermissions = {
  createExchangeAccount: and(isAuthenticated, hasMembershipAccessFromArgs),
  deleteExchangeAccount: and(isAuthenticated, hasExchangeAccountAccessFromArgs),
  updateExchangeAccount: and(isAuthenticated, hasExchangeAccountAccessFromArgs),
  toggleExchangeAccountActive: and(isAuthenticated, hasExchangeAccountAccessFromArgs),
}
