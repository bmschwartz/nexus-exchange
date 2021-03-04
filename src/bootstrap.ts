import { accountMonitor, prisma } from "./context";
import { initBinance } from "./exchange/binance";
import { initBitmex } from "./exchange/bitmex";

export function bootstrap() {
  // TODO: Re-init binance eventually
  // initBinance(prisma)
  initBitmex(prisma)
    .then(r => console.log("Start Bitmex Client: Success"))
    .catch(e => console.error(`Start Bitmex Client: Failed (${e})`))

  accountMonitor.start()
    .then(() => console.log("Start Account Monitor: Success"))
    .catch(e => console.error(`Start Account Monitor: Failed (${e})`))
}
