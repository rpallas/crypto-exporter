const Gauge = require('prom-client').Gauge;
const Ccxt = require('ccxt');

const tokenGauges = {};
function setMetric(name, value, labels) {
  if (value === undefined || isNaN(value)) return;
  if (!tokenGauges[name]) {
    tokenGauges[name] = new Gauge({ name: `crypto_ticker_${name}`, help: 'crypto ticker metric', labelNames: Object.keys(labels) });
  }
  tokenGauges[name].set(labels, Number(value));
}

async function fetchTickers (exchange) {
  if (exchange.has.publicAPI && exchange.has.fetchTickers) {
    return {
      id: exchange.id,
      name: exchange.name,
      tickers: await exchange.fetchTickers()
    };
  }
}

function scrape() {
  return Promise.all(Ccxt.exchanges
    .map(name => new Ccxt[name]())
    .map(exchange => fetchTickers(exchange))
    .map(promise => promise.catch(() => undefined))); // ensure Promise.all doesn't stop on errors
}

function arrange(response) {
  let metricCount = 0;
  // console.log('response', response.find(r => r !== undefined));
  response.forEach(exchange => {
    if (exchange) {
      const { tickers, id, name } = exchange;
      for (const ticker in tickers) {
        const { symbol, info } = tickers[ticker];
        for (const metric in info) {
          setMetric(metric, info[metric], { symbol, id, name });
          metricCount++;
        }
      }
    }
  });
  console.log(`${new Date().toISOString()} - ccxt exchange metrics collected (count: ${metricCount})`);
}

function collect() {
  return scrape().then((response) => arrange(response));
}

module.exports = { collect };
