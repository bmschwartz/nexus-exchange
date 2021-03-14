/*
  Warnings:

  - You are about to alter the column `lastPrice` on the `BitmexCurrency` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `markPrice` on the `BitmexCurrency` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `maxPrice` on the `BitmexCurrency` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `tickSize` on the `BitmexCurrency` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `avgPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `quantity` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `filledQty` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `stopPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `pegOffsetValue` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `OrderSet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `stopPrice` on the `OrderSet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `avgPrice` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `quantity` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `markPrice` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `margin` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `maintenanceMargin` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "BitmexCurrency" ALTER COLUMN "lastPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "markPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "maxPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "tickSize" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "avgPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "filledQty" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "stopPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "pegOffsetValue" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "OrderSet" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "stopPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Position" ALTER COLUMN "avgPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "markPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "margin" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "maintenanceMargin" SET DATA TYPE DECIMAL(65,30);
