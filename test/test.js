require("mocha");
const { assert } = require("chai");
const { getTicker } = require("../lib/index");

describe("getTicker", () => {
  it("getTicker", function(done) {
    const options = {
      exchange: "hitbtc",
      currency: "USD",
      asset: "BTC"
    };
    assert.isFunction(getTicker);
    getTicker(options).then(ticker => {
      assert.isObject(ticker);
      assert.property(ticker, "ask");
      assert.property(ticker, "bid");
      assert.isNumber(ticker.ask);
      assert.isNumber(ticker.bid);
      done();
    });
  });
});
