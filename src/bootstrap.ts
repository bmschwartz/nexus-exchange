import { prisma } from './context';
import { initBinance } from "./exchange/binance";
import { initBitmex } from "./exchange/bitmex";

export function bootstrap() {
  initBinance(prisma)
  initBitmex(prisma)
}