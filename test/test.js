require("mocha");
const { assert } = require("chai");
const { ExchangeService } = require("../lib/index");

describe("ExchangeService", () => {
    it("getCandles", function (done) {
        const options = {
            exchange: "hitbtc",
            currency: "USD",
            asset: "BTC",
            period: 1,
            begin: "2020-04-01T00:00:00",
            end: "2020-04-01T01:00:00",
        };

        assert.isFunction(ExchangeService.getCandles);

        const stream = ExchangeService.getCandles(options);
        stream.on("data", (candle) => {
            assert.isObject(candle);
            assert.property(candle, "time");
            assert.property(candle, "open");
            assert.property(candle, "high");
            assert.property(candle, "low");
            assert.property(candle, "close");
            assert.property(candle, "volume");
            assert.isString(candle.time);
            assert.isNumber(candle.open);
            assert.isNumber(candle.high);
            assert.isNumber(candle.low);
            assert.isNumber(candle.close);
            assert.isNumber(candle.volume);
        });
        stream.on("end", () => {
            done();
        });
    });

    it("getCandleStream", function (done) {
        this.timeout(5000);
        const options = {
            exchange: "hitbtc",
            currency: "USD",
            asset: "BTC",
            period: 1,
        };

        assert.isFunction(ExchangeService.getCandleStream);

        const stream = ExchangeService.getCandleStream(options);
        stream.on("data", (candle) => {
            assert.isObject(candle);
            assert.property(candle, "time");
            assert.property(candle, "open");
            assert.property(candle, "high");
            assert.property(candle, "low");
            assert.property(candle, "close");
            assert.property(candle, "volume");
            assert.isString(candle.time);
            assert.isNumber(candle.open);
            assert.isNumber(candle.high);
            assert.isNumber(candle.low);
            assert.isNumber(candle.close);
            assert.isNumber(candle.volume);
        });
        setTimeout(() => {
            stream.destroy();
        }, 1000);
        stream.on("close", () => {
            done();
        });
    });

    it("getTicker", function (done) {
        const options = {
            exchange: "hitbtc",
            currency: "USD",
            asset: "BTC",
        };
        assert.isFunction(ExchangeService.getTicker);
        ExchangeService.getTicker(options).then((ticker) => {
            assert.isObject(ticker);
            assert.property(ticker, "ask");
            assert.property(ticker, "bid");
            assert.isNumber(ticker.ask);
            assert.isNumber(ticker.bid);
            done();
        });
    });
});
