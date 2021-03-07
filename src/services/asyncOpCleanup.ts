import schedule from "node-schedule"
import {PrismaClient} from "@prisma/client";

export const ASYNC_OPERATION_TTL = 10 * 60 * 1000 // ms

export class AsyncOpCleanupClient {
  _db: PrismaClient
  _cleanUpAsyncOpJob: schedule.Job

  constructor(prisma: PrismaClient) {
    this._db = prisma
  }

  start() {
    this._cleanUpAsyncOpJob = schedule.scheduleJob(
      "cleanupAsyncOp",
      "* * * * *",
      this._cleanUpAsyncOps(this._db),
    )
  }

  _cleanUpAsyncOps(prisma: PrismaClient) {
    return async () => {
      const expiredCutoffDate = new Date(Date.now() - ASYNC_OPERATION_TTL)
      await prisma.asyncOperation.deleteMany({
        where: { createdAt: { lte: expiredCutoffDate }},
      })
    }
  }
}
