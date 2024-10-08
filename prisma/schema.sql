DROP DATABASE IF EXISTS "nexus_exchange";
CREATE DATABASE "nexus_exchange";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  'CREATE_BINANCE_ACCOUNT', 'UPDATE_BINANCE_ACCOUNT', 'DELETE_BINANCE_ACCOUNT',
  'DISABLE_BINANCE_ACCOUNT', 'CREATE_BITMEX_ORDER', 'UPDATE_BITMEX_ORDER',
  'CANCEL_BITMEX_ORDER', 'CREATE_BITMEX_ACCOUNT', 'UPDATE_BITMEX_ACCOUNT',
  'DELETE_BITMEX_ACCOUNT', 'DISABLE_BITMEX_ACCOUNT', 'CLOSE_BITMEX_POSITION',
  'ADD_STOP_BITMEX_POSITION', 'ADD_TSL_BITMEX_POSITION'
);
CREATE TYPE "StopTriggerType" AS ENUM('LAST_PRICE', 'MARK_PRICE');
CREATE TYPE "PegPriceType" AS ENUM(
  'LastPeg',
  'MidPricePeg',
  'MarketPeg',
  'PrimaryPeg',
  'TrailingStopPeg'
);

CREATE TABLE "public"."ExchangeAccount" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  active BOOLEAN NOT NULL DEFAULT false,
  exchange "Exchange" NOT NULL,
  "membershipId" uuid NOT NULL,
  "remoteAccountId" VARCHAR(255),
  "apiKey" VARCHAR(255),
  "apiSecret" VARCHAR(255),
  "lastHeartbeat" TIMESTAMP NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

  UNIQUE ("exchange", "membershipId")
);

CREATE TABLE "public"."OrderSet" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange "Exchange" NOT NULL,
  symbol VARCHAR(255) NOT NULL,
  "description" TEXT,
  "groupId" uuid NOT NULL,
  "orderType" "OrderType" NOT NULL,
  "price" DECIMAL,
  "percent" DECIMAL NOT NULL,
  "side" "OrderSide" NOT NULL,
  "closeOrderSet" BOOLEAN NOT NULL,
  "leverage" DECIMAL NOT NULL,
  "stopPrice" DECIMAL,
  "trailingStopPercent" DECIMAL,
  "stopTriggerType" "StopTriggerType",
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."Order" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderSetId" uuid NOT NULL,
  "exchangeAccountId" uuid NOT NULL,
  "clOrderId" uuid UNIQUE DEFAULT uuid_generate_v4(),
  "clOrderLinkId" VARCHAR(255),
  "symbol" VARCHAR(255) NOT NULL,
  "exchange" "Exchange" NOT NULL,
  "side" "OrderSide" NOT NULL,
  "closeOrder" BOOLEAN NOT NULL,
  "lastTimestamp" TIMESTAMP,
  "orderType" "OrderType",
  "price" DECIMAL,
  "avgPrice" DECIMAL,
  "quantity" DECIMAL,
  "filledQty" DECIMAL,
  "status" "OrderStatus" NOT NULL,
  "leverage" DECIMAL NOT NULL,
  "stopPrice" DECIMAL,
  "trailingStopPercent" DECIMAL,
  "stopTriggerType" "StopTriggerType",
  "pegOffsetValue" DECIMAL,
  "pegPriceType" "PegPriceType",
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("orderSetId") REFERENCES "public"."OrderSet"(id) ON DELETE SET NULL,
  FOREIGN KEY ("exchangeAccountId") REFERENCES "public"."ExchangeAccount"(id) ON DELETE SET NULL
);

CREATE TABLE "public"."Position" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "exchangeAccountId" uuid NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "isOpen" BOOLEAN NOT NULL DEFAULT false,
  "exchange" "Exchange" NOT NULL,
  "side" "PositionSide" NOT NULL,
  "avgPrice" DECIMAL,
  "quantity" DECIMAL,
  "leverage" DECIMAL,
  "markPrice" DECIMAL,
  "margin" DECIMAL,
  "maintenanceMargin" DECIMAL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("exchangeAccountId") REFERENCES "public"."ExchangeAccount"(id) ON DELETE SET NULL,

  UNIQUE ("symbol", "exchangeAccountId")
);

CREATE TABLE "public"."BitmexCurrency" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  active BOOLEAN DEFAULT false,
  symbol VARCHAR(255) UNIQUE NOT NULL,
  underlying VARCHAR(255) NOT NULL,
  "quoteCurrency" VARCHAR(255) NOT NULL,
  "fractionalDigits" INTEGER,
  "lastPrice" DECIMAL,
  "markPrice" DECIMAL,
  "maxPrice" DECIMAL,
  "tickSize" DECIMAL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."BinanceCurrency" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE TABLE "public"."AsyncOperation" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  DELETE FROM "public"."AsyncOperation" WHERE "createdAt" < NOW() - INTERVAL '15 minutes';
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_delete_old_async_operations
    AFTER INSERT ON "public"."AsyncOperation"
    EXECUTE PROCEDURE delete_old_async_operations();

CREATE INDEX idx_position_symbol ON "public"."Position"("symbol");
CREATE INDEX idx_position_exchange_account_id ON "public"."Position"("exchangeAccountId");
