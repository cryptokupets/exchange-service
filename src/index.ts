import { EventEmitter } from "events";
import { Exchange as Hitbtc } from "hitbtc-connect";
import moment from "moment";
import { Readable, Transform } from "stream";

const exchanges: any = {
    hitbtc: new Hitbtc(),
};

function getExchange(exchange: string): IMarketDataSource {
    return exchanges[exchange] as IMarketDataSource;
}

export interface ICandle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ITicker {
    ask: number;
    bid: number;
}

interface IMarketDataSource {
    getPairs(): Promise<Array<{ currency: string; asset: string }>>;
    getPeriods(): Promise<number[]>;
    getCandles(options: {
        currency: string;
        asset: string;
        period: number;
        start: string;
        end: string;
    }): Promise<ICandle[]>;
    liveCandles(options: {
        currency: string;
        asset: string;
        period: number;
    }): Readable;
    getTicker(options: { currency: string; asset: string }): Promise<ITicker>;
    liveTicker(options: { currency: string; asset: string }): Readable;
}

export function getPairs(
    exchange: string
): Promise<Array<{ currency: string; asset: string }>> {
    return getExchange(exchange).getPairs();
}

export function getPeriods(exchange: string): Promise<number[]> {
    return getExchange(exchange).getPeriods();
}

export function getExchanges(): string[] {
    return Object.keys(exchanges);
}

// DEPRICATED
export function streamCandle({
    exchange,
    currency,
    asset,
    period,
    start,
    end,
}: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    start?: string;
    end?: string;
}): Readable {
    let startMoment = moment.utc(start);
    const rs = new Readable({
        read: async () => {
            if (!end) {
                const now = moment().utc();
                const delay = Math.max(
                    moment(startMoment).add(period, "m").diff(now),
                    0
                );
                setTimeout(async () => {
                    const nowMoment = moment().utc();
                    const minutes = Math.floor(
                        Math.floor(nowMoment.get("m") / period) * period
                    );
                    const endMoment = moment(nowMoment)
                        .startOf("h")
                        .minute(minutes)
                        .add(-1, "s");

                    const response = await getExchange(exchange).getCandles({
                        currency,
                        asset,
                        period,
                        start: startMoment.toISOString(),
                        end: endMoment.toISOString(),
                    });

                    if (response.length) {
                        startMoment = moment
                            .utc(response[response.length - 1].time)
                            .add(period, "m");
                        rs.push(JSON.stringify(response));
                    } else {
                        startMoment = moment(endMoment).add(1, "s");
                        rs.push(JSON.stringify([]));
                    }
                }, delay);
            } else if (startMoment.isSameOrBefore(moment.utc(end))) {
                const response = await getExchange(exchange).getCandles({
                    currency,
                    asset,
                    period,
                    start: startMoment.toISOString(),
                    end,
                });
                if (response.length) {
                    startMoment = moment
                        .utc(response[response.length - 1].time)
                        .add(period, "m");
                    rs.push(JSON.stringify(response));
                }
            } else {
                rs.push(null);
            }
        },
    });
    return rs;
}

export function importCandles({
    exchange,
    currency,
    asset,
    period,
    begin,
    end,
}: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
}): Readable {
    let beginMoment = moment.utc(begin);
    const rs = new Readable({
        objectMode: true,
        read: async () => {
            if (beginMoment.isSameOrBefore(moment.utc(end))) {
                const response = await getExchange(exchange).getCandles({
                    currency,
                    asset,
                    period,
                    start: beginMoment.toISOString(),
                    end,
                });
                if (response.length) {
                    beginMoment = moment
                        .utc(response[response.length - 1].time)
                        .add(period, "m");
                    rs.push(response);
                }
            } else {
                rs.push(null);
            }
        },
    });
    return rs;
}

export function liveCandles({
    exchange,
    currency,
    asset,
    period,
}: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
}): Readable {
    return getExchange(exchange).liveCandles({
        currency,
        asset,
        period,
    });
}

export function liveTicker({
    exchange,
    currency,
    asset,
}: {
    exchange: string;
    currency: string;
    asset: string;
}): Readable {
    return getExchange(exchange).liveTicker({
        currency,
        asset,
    });
}

export function getTicker({
    exchange,
    currency,
    asset,
}: {
    exchange: string;
    currency: string;
    asset: string;
}): Promise<ITicker> {
    return getExchange(exchange).getTicker({
        currency,
        asset,
    });
}

export class ExchangeService extends EventEmitter {
    public static getCandles(options: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
        begin: string;
        end: string;
    }): Readable {
        const rs = importCandles(options);
        const ts = new Transform({
            objectMode: true,
            transform: async (chunk, encoding, callback) => {
                const candles: ICandle[] = chunk as ICandle[];
                while (candles.length) {
                    const candle = candles.shift();
                    ts.push(candle);
                }
                callback();
            },
            destroy: (err, callback) => {
                rs.on("end", () => {
                    callback(err);
                });
                rs.destroy(err);
            },
        });
        return rs.pipe(ts);
    }

    public static async getTicker(options: {
        exchange: string;
        currency: string;
        asset: string;
    }): Promise<ITicker> {
        return getTicker(options);
    }

    public static getTickerStream({
        exchange,
        currency,
        asset,
    }: {
        exchange: string;
        currency: string;
        asset: string;
    }): Readable {
        return liveTicker({ exchange, currency, asset });
    }
}
