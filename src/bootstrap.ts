import { prisma } from './context';
import { initBinance } from "./exchange/binance";

export function bootstrap() {
  initBinance(prisma)
}