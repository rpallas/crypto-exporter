const Gauge = require('prom-client').Gauge;

const tokenGauges = {};
function setMetric(name, value, labels) {
  if (!tokenGauges[name]) {
    tokenGauges[name] = new Gauge({ name: `coin_market_${name}`, help: 'coinmarketcap metric', labelNames: Object.keys(labels) });
  }
  tokenGauges[name].set(labels, Number(value));
}

function scrape(services) {
  return services.http.request('https://api.coinmarketcap.com/v1/ticker/?convert=GBP&limit=0');
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

function collect(services) {
  return scrape(services).then((response) => arrange(response));
}

module.exports = { collect };
