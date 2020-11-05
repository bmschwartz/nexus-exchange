import { PrismaClient } from "@prisma/client";
import Bull, { Job } from "bull";

let _db: PrismaClient

async function _checkAccountLife(job: Job) {
  console.log("checking account lives")
}

export class AccountMonitor {
  _accountMonitorQueue: Bull.Queue

  constructor(prisma: PrismaClient) {
    _db = prisma
    this._accountMonitorQueue = new Bull("accountMonitorQueue")

    const processName = "runAccountMonitor"
    this._accountMonitorQueue.process(processName, _checkAccountLife)
  }
}