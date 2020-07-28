/** OrderSet */
INSERT INTO "OrderSet" (description, "groupId")
VALUES ('bottom out for btc', 1);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('btc high', 3);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('a', 2);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('on the lookout', 3);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('sell off!', 3);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('btc bubble', 2);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('btc going to take off', 2);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('b', 2);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('peak on btc', 1);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('just for fun', 2);

INSERT INTO "OrderSet" (description, "groupId")
VALUES ('individual trade', 1);



/** Orders */
INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (1, 2, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (1, 3, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (2, 5, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (3, 10, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (4, 7, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (5, 10, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (6, 9, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (7, 8, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (8, 7, 'BTC', 'SELL');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (8, 6, 'BTC', 'SELL');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (9, 6, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (10, 3, 'BTC', 'BUY');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (11, 1, 'BTC', 'SELL');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (11, 2, 'BTC', 'SELL');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (11, 3, 'BTC', 'SELL');

INSERT INTO "Order" ("orderSetId", "membershipId", symbol, side)
VALUES (11, 5, 'BTC', 'SELL');



/** BitmexCurrency */
INSERT INTO "BitmexCurrency" ("symbol", "underlying", "active", "fractionalDigits", "lastPrice", "markPrice", "tickSize")
VALUES ('LTCUSD', 'LTC', TRUE, 2, 49.13, 49.155, 0.01);

INSERT INTO "BitmexCurrency" ("symbol", "underlying", "active", "fractionalDigits", "lastPrice", "markPrice", "tickSize")
VALUES ('ETHUSD', 'ETH', TRUE, 2, 323.35, 324.61, 0.05);

INSERT INTO "BitmexCurrency" ("symbol", "underlying", "active", "fractionalDigits", "lastPrice", "markPrice", "tickSize")
VALUES ('XBTUSD', 'XBT', TRUE, 1, 10048, 10064.76, 0.5);

INSERT INTO "BitmexCurrency" ("symbol", "underlying", "active", "fractionalDigits", "lastPrice", "markPrice", "tickSize")
VALUES ('BCHUSD', 'BCH', TRUE, 2, 252.15, 252.38, 0.05);

INSERT INTO "BitmexCurrency" ("symbol", "underlying", "active", "fractionalDigits", "lastPrice", "markPrice", "tickSize")
VALUES ('XRPUSD', 'XRP', TRUE, 4, 0.2189, 0.2192, 0.0001);



/** BitmexCurrency */
INSERT INTO "BinanceCurrency" ("symbol", "lastPrice", "openPrice", "highPrice", "lowPrice", "priceChange", "priceChangePercent")
VALUES ('BTCUSD', '10439', '10400', '10500', '10400', '500', '0.0096');

INSERT INTO "BinanceCurrency" ("symbol", "lastPrice", "openPrice", "highPrice", "lowPrice", "priceChange", "priceChangePercent")
VALUES ('LTCUSD', '498', '43', '22', '133', '33', '0.13');

INSERT INTO "BinanceCurrency" ("symbol", "lastPrice", "openPrice", "highPrice", "lowPrice", "priceChange", "priceChangePercent")
VALUES ('ETHUSD', '43', '2323', '43', '11', '55', '0.25');

INSERT INTO "BinanceCurrency" ("symbol", "lastPrice", "openPrice", "highPrice", "lowPrice", "priceChange", "priceChangePercent")
VALUES ('XRPUSD', '75', '1', '22', '33', '22', '0.15');

INSERT INTO "BinanceCurrency" ("symbol", "lastPrice", "openPrice", "highPrice", "lowPrice", "priceChange", "priceChangePercent")
VALUES ('TRXUSD', '989', '83', '1000', '43', '65', '0.38');

INSERT INTO "BinanceCurrency" ("symbol", "lastPrice", "openPrice", "highPrice", "lowPrice", "priceChange", "priceChangePercent")
VALUES ('EOSUSD', '98', '14', '65', '22', '9', '.24');