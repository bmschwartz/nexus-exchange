DROP DATABASE IF EXISTS "nexus_exchange";
CREATE DATABASE "nexus_exchange";

CREATE TYPE "OrderSide" AS ENUM('BUY', 'SELL');
CREATE TYPE "OrderType" AS ENUM('MARKET', 'LIMIT');
CREATE TYPE "PositionSide" AS ENUM('LONG', 'SHORT');
CREATE TYPE "Exchange" AS ENUM('BINANCE', 'BITMEX');
CREATE TYPE "BinanceSymbolStatus" AS ENUM(
  'PRE_TRADING', 'TRADING', 'POST_TRADING',
  'END_OF_DAY', 'HALT', 'AUCTION_MATCH', 'BREAK'
);
CREATE TYPE "OrderStatus" AS ENUM(
  'NEW', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED'
);
CREATE TYPE "OperationType" AS ENUM(
  'CREATE_BINANCE_ORDER', 'UPDATE_BINANCE_ORDER', 'CANCEL_BINANCE_ORDER',
  'CREATE_BINANCE_ACCOUNT', 'UPDATE_BINANCE_ACCOUNT', 'DELETE_BINANCE_ACCOUNT'
);

CREATE TABLE "public"."OrderSet" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  exchange "Exchange" NOT NULL,
  symbol VARCHAR(255) NOT NULL,
  "description" TEXT,
  "groupId" INTEGER NOT NULL,
  "orderType" "OrderType" NOT NULL,
  "price" DECIMAL,
  "stopPrice" DECIMAL,
  "percent" DECIMAL NOT NULL,
  "side" "OrderSide" NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."Order" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "orderSetId" BIGINT NOT NULL,
  "exchangeAccountId" INTEGER NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "exchange" "Exchange" NOT NULL,
  "side" "OrderSide" NOT NULL,
  "lastTimestamp" TIMESTAMP,
  "orderType" "OrderType",
  "price" DECIMAL,
  "stopPrice" DECIMAL,
  "quantity" DECIMAL,
  "filledQty" DECIMAL,
  "status" "OrderStatus" NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("orderSetId") REFERENCES "public"."OrderSet"(id),
  FOREIGN KEY ("exchangeAccountId") REFERENCES "public"."ExchangeAccount"(id)
);

CREATE TABLE "public"."Position" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "exchangeAccountId" INTEGER NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "exchange" "Exchange" NOT NULL,
  "side" "PositionSide" NOT NULL,
  "avgPrice" DECIMAL,
  "quantity" DECIMAL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("exchangeAccountId") REFERENCES "public"."ExchangeAccount"(id)
);

CREATE TABLE "public"."BitmexCurrency" (
  id SERIAL PRIMARY KEY NOT NULL,
  symbol VARCHAR(255) UNIQUE NOT NULL,
  underlying VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT false,
  "fractionalDigits" INTEGER,
  "lastPrice" DECIMAL,
  "markPrice" DECIMAL,
  "tickSize" DECIMAL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."BinanceCurrency" (
  id SERIAL PRIMARY KEY NOT NULL,
  symbol VARCHAR(255) UNIQUE NOT NULL,
  "status" "BinanceSymbolStatus" NOT NULL,
  "baseAsset" VARCHAR(255) NOT NULL,
  "baseAssetPrecision" INTEGER,
  "quoteAsset" VARCHAR(255) NOT NULL,
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
  "lastPrice" VARCHAR(255),
  "openPrice" VARCHAR(255),
  "highPrice" VARCHAR(255),
  "lowPrice" VARCHAR(255),
  "priceChange" VARCHAR(255),
  "priceChangePercent" VARCHAR(255),
  "minPrice" VARCHAR(255),
  "maxPrice" VARCHAR(255),
  "tickSize" VARCHAR(255),
  "multiplierUp" VARCHAR(255),
  "multiplierDown" VARCHAR(255),
  "percentAvgPriceMins" DECIMAL,
  "minQty" VARCHAR(255),
  "maxQty" VARCHAR(255),
  "stepSize" VARCHAR(255),
  "minNotional" VARCHAR(255),
  "applyToMarket" BOOLEAN DEFAULT false,
  "minNotionalAvgPriceMins" DECIMAL,
  "icebergLimit" DECIMAL,
  "marketMinQty" VARCHAR(255),
  "marketMaxQty" VARCHAR(255),
  "marketStepSize" VARCHAR(255),
  "maxNumOrders" INTEGER,
  "maxNumAlgoOrders" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."ExchangeAccount" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  exchange "Exchange" NOT NULL,
  "membershipId" INTEGER NOT NULL,
  "remoteAccountId" VARCHAR(255),
  "apiKey" VARCHAR(255) NOT NULL,
  "apiSecret" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

  UNIQUE ("exchange", "membershipId")
);

CREATE TABLE "public"."AsyncOperation" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "opType" "OperationType" NOT NULL,
  complete BOOLEAN NOT NULL DEFAULT false,
  success BOOLEAN DEFAULT false,
  error VARCHAR(255),
  payload JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

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

ALTER TABLE "public"."AsyncOperation"
  ADD COLUMN "userId" INTEGER NOT NULL;