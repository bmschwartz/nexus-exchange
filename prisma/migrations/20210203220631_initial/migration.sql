CREATE EXTENSION "pgcrypto";

-- CreateEnum
CREATE TYPE "BinanceSymbolStatus" AS ENUM ('PRE_TRADING', 'TRADING', 'POST_TRADING', 'END_OF_DAY', 'HALT', 'AUCTION_MATCH', 'BREAK');

-- CreateEnum
CREATE TYPE "Exchange" AS ENUM ('BINANCE', 'BITMEX');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "PositionSide" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "StopTriggerType" AS ENUM ('LAST_PRICE', 'MARK_PRICE');

-- CreateEnum
CREATE TYPE "PegPriceType" AS ENUM ('LastPeg', 'MidPricePeg', 'MarketPeg', 'PrimaryPeg', 'TrailingStopPeg');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('CREATE_BINANCE_ORDER', 'UPDATE_BINANCE_ORDER', 'CANCEL_BINANCE_ORDER', 'CREATE_BINANCE_ACCOUNT', 'UPDATE_BINANCE_ACCOUNT', 'DELETE_BINANCE_ACCOUNT', 'DISABLE_BINANCE_ACCOUNT', 'CREATE_BITMEX_ORDER', 'UPDATE_BITMEX_ORDER', 'CANCEL_BITMEX_ORDER', 'CREATE_BITMEX_ACCOUNT', 'UPDATE_BITMEX_ACCOUNT', 'DELETE_BITMEX_ACCOUNT', 'DISABLE_BITMEX_ACCOUNT', 'CLOSE_BITMEX_POSITION', 'ADD_STOP_BITMEX_POSITION', 'ADD_TSL_BITMEX_POSITION');

-- CreateTable
CREATE TABLE "BinanceCurrency" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "symbol" TEXT NOT NULL,
    "status" "BinanceSymbolStatus" NOT NULL,
    "baseAsset" TEXT NOT NULL,
    "baseAssetPrecision" INTEGER,
    "quoteAsset" TEXT NOT NULL,
    "quotePrecision" INTEGER,
    "quoteAssetPrecision" INTEGER,
    "baseCommissionPrecision" INTEGER,
    "quoteCommissionPrecision" INTEGER,
    "allowsLimit" BOOLEAN DEFAULT false,
    "allowsMarket" BOOLEAN DEFAULT false,
    "allowsStopLoss" BOOLEAN DEFAULT false,
    "allowsStopLossLimit" BOOLEAN DEFAULT false,
    "allowsTakeProfit" BOOLEAN DEFAULT false,
    "allowsTakeProfitLimit" BOOLEAN DEFAULT false,
    "allowsLimitMaker" BOOLEAN DEFAULT false,
    "icebergAllowed" BOOLEAN DEFAULT false,
    "ocoAllowed" BOOLEAN DEFAULT false,
    "quoteOrderQtyMarketAllowed" BOOLEAN DEFAULT false,
    "isSpotTradingAllowed" BOOLEAN DEFAULT false,
    "isMarginTradingAllowed" BOOLEAN DEFAULT false,
    "spotPermission" BOOLEAN DEFAULT false,
    "leveragedPermission" BOOLEAN DEFAULT false,
    "marginPermission" BOOLEAN DEFAULT false,
    "lastPrice" TEXT,
    "openPrice" TEXT,
    "highPrice" TEXT,
    "lowPrice" TEXT,
    "priceChange" TEXT,
    "priceChangePercent" TEXT,
    "minPrice" TEXT,
    "maxPrice" TEXT,
    "tickSize" TEXT,
    "multiplierUp" TEXT,
    "multiplierDown" TEXT,
    "percentAvgPriceMins" DOUBLE PRECISION,
    "minQty" TEXT,
    "maxQty" TEXT,
    "stepSize" TEXT,
    "minNotional" TEXT,
    "applyToMarket" BOOLEAN DEFAULT false,
    "minNotionalAvgPriceMins" DOUBLE PRECISION,
    "icebergLimit" DOUBLE PRECISION,
    "marketMinQty" TEXT,
    "marketMaxQty" TEXT,
    "marketStepSize" TEXT,
    "maxNumOrders" INTEGER,
    "maxNumAlgoOrders" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BitmexCurrency" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "active" BOOLEAN DEFAULT false,
    "symbol" TEXT NOT NULL,
    "underlying" TEXT NOT NULL,
    "quoteCurrency" TEXT NOT NULL,
    "fractionalDigits" INTEGER,
    "lastPrice" DOUBLE PRECISION,
    "markPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "tickSize" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderSet" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exchange" "Exchange" NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "groupId" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "price" DOUBLE PRECISION,
    "percent" DOUBLE PRECISION NOT NULL,
    "side" "OrderSide" NOT NULL,
    "closeOrderSet" BOOLEAN NOT NULL,
    "leverage" DOUBLE PRECISION NOT NULL,
    "stopPrice" DOUBLE PRECISION,
    "trailingStopPercent" DOUBLE PRECISION,
    "stopTriggerType" "StopTriggerType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeAccount" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "exchange" "Exchange" NOT NULL,
    "membershipId" TEXT NOT NULL,
    "remoteAccountId" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsyncOperation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "opType" "OperationType" NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN DEFAULT false,
    "error" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderSetId" UUID NOT NULL,
    "exchangeAccountId" UUID NOT NULL,
    "clOrderId" UUID DEFAULT gen_random_uuid(),
    "clOrderLinkId" TEXT,
    "symbol" TEXT NOT NULL,
    "exchange" "Exchange" NOT NULL,
    "side" "OrderSide" NOT NULL,
    "closeOrder" BOOLEAN NOT NULL,
    "lastTimestamp" TIMESTAMP(3),
    "orderType" "OrderType",
    "price" DOUBLE PRECISION,
    "avgPrice" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION,
    "filledQty" DOUBLE PRECISION,
    "status" "OrderStatus" NOT NULL,
    "leverage" DOUBLE PRECISION NOT NULL,
    "stopPrice" DOUBLE PRECISION,
    "trailingStopPercent" DOUBLE PRECISION,
    "stopTriggerType" "StopTriggerType",
    "pegOffsetValue" DOUBLE PRECISION,
    "pegPriceType" "PegPriceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exchangeAccountId" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "exchange" "Exchange" NOT NULL,
    "side" "PositionSide" NOT NULL,
    "avgPrice" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION,
    "leverage" DOUBLE PRECISION,
    "markPrice" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "maintenanceMargin" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BinanceCurrency.symbol_unique" ON "BinanceCurrency"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "BitmexCurrency.symbol_unique" ON "BitmexCurrency"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeAccount_exchange_membershipId_key" ON "ExchangeAccount"("exchange", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "Order.clOrderId_unique" ON "Order"("clOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Position_symbol_exchangeAccountId_key" ON "Position"("symbol", "exchangeAccountId");

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("exchangeAccountId") REFERENCES "ExchangeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("orderSetId") REFERENCES "OrderSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD FOREIGN KEY ("exchangeAccountId") REFERENCES "ExchangeAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE FUNCTION delete_old_async_operations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM "public"."AsyncOperation" WHERE "createdAt" < NOW() - INTERVAL '3 days';
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_delete_old_async_operations
    AFTER INSERT ON "public"."AsyncOperation"
    EXECUTE PROCEDURE delete_old_async_operations();
