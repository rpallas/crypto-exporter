const Got = require('got');
const Gauge = require('prom-client').Gauge;
const Pkg = require('../package.json');

const tokenGauges = {};
function setMetric(name, value, labels) {
  if (!tokenGauges[name]) {
    tokenGauges[name] = new Gauge({ name: `coin_market_${name}`, help: 'coinmarketcap metric', labelNames: Object.keys(labels) });
  }
  tokenGauges[name].set(labels, Number(value));
}

async function scrape() {
  const requestOptions = {
    json: true,
    headers: { 'user-agent': `crypto-exporter/${Pkg.version}` }
  };
  try {
    return await Got('https://api.coinmarketcap.com/v1/ticker/?convert=GBP&limit=0', requestOptions);
  } catch (error) {
    console.log(`Coinmarketcap api request error: ${error}`);
  }
}

function arrange(response) {
  response.body.forEach(token => {
    const { id, name, symbol, ...tokenMetrics } = token;
    for (const metric in tokenMetrics) {
      setMetric(metric, tokenMetrics[metric], { id: id, name: name, symbol: symbol });
    }
  });
  console.log(`${new Date().toISOString()} - coinmarketcap metrics collected`);
}

function collect() {
  return scrape().then((response) => arrange(response));
}

module.exports = { collect };
