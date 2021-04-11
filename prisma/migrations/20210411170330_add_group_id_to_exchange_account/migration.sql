/*
  Warnings:

  - Added the required column `groupId` to the `ExchangeAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExchangeAccount" ADD COLUMN     "groupId" TEXT NOT NULL;
