import { Exchange as Hitbtc } from "hitbtc-connect";

const exchanges: any = {
  hitbtc: new Hitbtc()
};

function getExchange(exchange: string): IExchange {
  return exchanges[exchange] as IExchange;
}

export interface ITicker {
  ask: number;
  bid: number;
}

export interface IExchange {
  getTicker(options: { currency: string; asset: string }): Promise<ITicker>;
}

export function getTicker({
  exchange,
  currency,
  asset
}: {
  exchange: string;
  currency: string;
  asset: string;
}): Promise<ITicker> {
  return getExchange(exchange).getTicker({
    currency,
    asset
  });
}
