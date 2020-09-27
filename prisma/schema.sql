DROP DATABASE IF EXISTS "nexus_exchange";
CREATE DATABASE "nexus_exchange";

CREATE TYPE ORDER_SIDE AS ENUM('BUY', 'SELL');
CREATE TYPE ORDER_TYPE AS ENUM('MARKET', 'LIMIT');
CREATE TYPE EXCHANGE AS ENUM('BINANCE', 'BITMEX');

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
  "membershipId" INTEGER NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "side" ORDER_SIDE NOT NULL,
  "lastTimestamp" TIMESTAMP,
  "orderType" ORDER_TYPE,
  "price" DECIMAL,
  "stopPrice" DECIMAL,
  "quantity" DECIMAL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  FOREIGN KEY ("orderSetId") REFERENCES "public"."OrderSet"(id)
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
  "lastPrice" VARCHAR(255),
  "openPrice" VARCHAR(255),
  "highPrice" VARCHAR(255),
  "lowPrice" VARCHAR(255),
  "priceChange" VARCHAR(255),
  "priceChangePercent" VARCHAR(255),
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