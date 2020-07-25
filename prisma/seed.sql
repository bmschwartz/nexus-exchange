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