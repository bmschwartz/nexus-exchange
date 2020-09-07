DROP DATABASE IF EXISTS "nexus_exchange";
CREATE DATABASE "nexus_exchange";

CREATE TYPE ORDER_SIDE AS ENUM('BUY', 'SELL');
CREATE TYPE ORDER_TYPE AS ENUM('MARKET', 'LIMIT');

CREATE TABLE "public"."OrderSet" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "description" TEXT,
  "groupId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "public"."Order" (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  "orderSetId" BIGINT NOT NULL,
  "membershipId" INTEGER NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "side" ORDER_SIDE NOT NULL,
  "lastTimestamp" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
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
  "tickSize" DECIMAL
);

CREATE TABLE "public"."BinanceCurrency" (
  id SERIAL PRIMARY KEY NOT NULL,
  symbol VARCHAR(255) UNIQUE NOT NULL,
  "lastPrice" VARCHAR(255),
  "openPrice" VARCHAR(255),
  "highPrice" VARCHAR(255),
  "lowPrice" VARCHAR(255),
  "priceChange" VARCHAR(255),
  "priceChangePercent" VARCHAR(255)
);

ALTER TABLE "public"."OrderSet"
  ADD COLUMN "orderType" ORDER_TYPE,
  ADD COLUMN "price" DECIMAL,
  ADD COLUMN "stopPrice" DECIMAL,
  ADD COLUMN "percent" DECIMAL;

ALTER TABLE "public"."Order"
  ADD COLUMN "orderType" ORDER_TYPE,
  ADD COLUMN "price" DECIMAL,
  ADD COLUMN "stopPrice" DECIMAL,
  ADD COLUMN "quantity" DECIMAL;

ALTER TABLE "public"."OrderSet"
  ADD COLUMN "side" ORDER_SIDE;
-------------------------------

------- ADD DATE FIELDS -------
ALTER TABLE "public"."OrderSet"
  ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();

ALTER TABLE "public"."Order"
  ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();

ALTER TABLE "public"."BitmexCurrency"
  ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();

ALTER TABLE "public"."BinanceCurrency"
  ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();
