DROP DATABASE IF EXISTS "nexus_exchange";
CREATE DATABASE "nexus_exchange";

CREATE TYPE ORDER_SIDE AS ENUM('BUY', 'SELL');
CREATE TYPE ORDER_TYPE AS ENUM('MARKET', 'LIMIT');
CREATE TYPE EXCHANGE AS ENUM('BINANCE', 'BITMEX');
CREATE TYPE BINANCE_SYMBOL_STATUS AS ENUM(
  'PRE_TRADING', 'TRADING', 'POST_TRADING',
  'END_OF_DAY', 'HALT', 'AUCTION_MATCH', 'BREAK'
);
CREATE TYPE ORDER_STATUS AS ENUM(
  'NEW', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED'
);


CREATE TABLE "public"."OrderSet" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "description" TEXT,
  "groupId" INTEGER NOT NULL,
  "orderType" ORDER_TYPE NOT NULL,
  "price" DECIMAL,
  "stopPrice" DECIMAL,
  "percent" DECIMAL NOT NULL,
  "side" ORDER_SIDE NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."Order" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "orderSetId" BIGINT NOT NULL,
  "exchangeAccountId" INTEGER NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "exchange" EXCHANGE NOT NULL,
  "side" ORDER_SIDE NOT NULL,
  "lastTimestamp" TIMESTAMP,
  "orderType" ORDER_TYPE,
  "price" DECIMAL,
  "stopPrice" DECIMAL,
  "quantity" DECIMAL,
  "filledQty" DECIMAL,
  "status" ORDER_STATUS NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("orderSetId") REFERENCES "public"."OrderSet"(id),
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
  "status" BINANCE_SYMBOL_STATUS NOT NULL,
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
  exchange EXCHANGE NOT NULL,
  "membershipId" INTEGER NOT NULL,
  "apiKey" VARCHAR(255) NOT NULL,
  "apiSecret" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

  UNIQUE ("exchange", "membershipId")
);

ALTER TABLE "public"."OrderSet"
ADD COLUMN exchange EXCHANGE NOT NULL,
ADD COLUMN symbol VARCHAR(255) NOT NULL;