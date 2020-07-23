DROP DATABASE IF EXISTS "monest_exchange";
CREATE DATABASE "monest_exchange";

CREATE TYPE ORDER_SIDE AS ENUM('BUY', 'SELL');

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