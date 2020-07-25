DROP DATABASE IF EXISTS "monest_exchange";
CREATE DATABASE "monest_exchange";

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