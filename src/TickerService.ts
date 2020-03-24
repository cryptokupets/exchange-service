import { EventEmitter } from "events";
import { Exchange as Hitbtc } from "hitbtc-connect";

export interface ITicker {
  ask: number;
  bid: number;
}

export interface IExchange {
    getTicker(options: {
  currency: string;
  asset: string;
});

onTicker(callback: any);
startTicker(options: {
  currency: string;
  asset: string;
});
stopTicker(options: {
  currency: string;
  asset: string;
});
}

export class TickerService extends EventEmitter {
    private static _exchanges: any = {
  hitbtc: new Hitbtc()
};

private static _getExchange(exchange: string): IExchange {
  return TickerService._exchanges[exchange] as IExchange;
};

  public exchange: string;
  public currency: string;
  public asset: string;
  private _stream: any;
  
    constructor(options: {
    exchange: string;
    currency: string;
    asset: string;
  }) {
    super();
    Object.assign(this, options);
  }

  public onTicker(callback: any) {
      this.on("ticker", callback);
  };
  public startTicker() {
      const { exchange, currency, asset } = this;
    let stream = TickerService._getExchange(exchange).liveTicker({
    currency,
    asset
  });
  this._stream = stream;
      stream.on("data", (ticker: ITicker) => {
        this.emit("ticker", ticker);
      });
    }
  }
  
  public async getTicker(): Promise<ITicker> {
    const { exchange, currency, asset } = this;
  return TickerService._getExchange(exchange).getTicker({
    currency,
    asset
  });
}


}
