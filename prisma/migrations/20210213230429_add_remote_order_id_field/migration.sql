/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[remoteOrderId]` on the table `Order`. If there are existing duplicate values, the migration will fail.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_exchangeAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_orderSetId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_exchangeAccountId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "remoteOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order.remoteOrderId_unique" ON "Order"("remoteOrderId");

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("exchangeAccountId") REFERENCES "ExchangeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("orderSetId") REFERENCES "OrderSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD FOREIGN KEY ("exchangeAccountId") REFERENCES "ExchangeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
