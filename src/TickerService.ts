import { EventEmitter } from "events";
import { Exchange as Hitbtc } from "hitbtc-connect";

export interface ITicker {
  ask: number;
  bid: number;
}

export interface IExchange {
  getTicker(options: { currency: string; asset: string });
  onTicker(callback: any);
  // startTicker(options: { currency: string; asset: string });
  // stopTicker(options: { currency: string; asset: string });
  liveTicker(options: { currency: string; asset: string });
}

export class TickerService extends EventEmitter {
  private static exchanges: any = {
    hitbtc: new Hitbtc()
  };

  private static getExchange(exchange: string): IExchange {
    return TickerService.exchanges[exchange] as IExchange;
  }

  public exchange: string;
  public currency: string;
  public asset: string;
  private stream: any;

  constructor(options: { exchange: string; currency: string; asset: string }) {
    super();
    Object.assign(this, options);
  }

  public onTicker(callback: any) {
    this.on("ticker", callback);
  }

  public subscribe() {
    const { exchange, currency, asset } = this;
    const stream = TickerService.getExchange(exchange).liveTicker({
      currency,
      asset
    });
    this.stream = stream;
    stream.on("data", (ticker: ITicker) => {
      this.emit("ticker", ticker);
    });
  }

  public unsubscribe() {
    this.stream.destroy();
    // TODO сначала отписать
  }

  public async getTicker(): Promise<ITicker> {
    const { exchange, currency, asset } = this;
    return TickerService.getExchange(exchange).getTicker({
      currency,
      asset
    });
  }
}
