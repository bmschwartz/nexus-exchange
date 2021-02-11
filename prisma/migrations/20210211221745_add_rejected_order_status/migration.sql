-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_exchangeAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_orderSetId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_exchangeAccountId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("exchangeAccountId") REFERENCES "ExchangeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("orderSetId") REFERENCES "OrderSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD FOREIGN KEY ("exchangeAccountId") REFERENCES "ExchangeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
