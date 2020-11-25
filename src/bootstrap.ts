import { accountMonitor, prisma } from './context';
import { initBinance } from "./exchange/binance";
import { initBitmex } from "./exchange/bitmex";

export function bootstrap() {
  initBinance(prisma)
  initBitmex(prisma)

  accountMonitor.start()
    .then(() => console.log("Start Account Monitor: Success"))
    .catch(e => console.error(`Start Account Monitor: Failed (${e})`))
}