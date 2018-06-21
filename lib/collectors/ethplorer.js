const Gauge = require('prom-client').Gauge;

function gauge(name, help, labels=['address']) {
  return new Gauge({ name: `ethplorer_account_${name}`, help: help, labelNames: labels })
}

const metrics = {
  ethBalance: gauge('eth_balance', 'Total balance of either in account'),
  ethTotalIn: gauge('eth_totalIn', 'Total either transferred into account'),
  ethTotalOut: gauge('eth_totalOut', 'Total either transferred out of account'),
  txnTotal: gauge('txn_total', 'Total number of transactons for account'),
  tokenHolderCount: gauge('token_holders', 'Number of accounts holding a token', ['address', 'symbol']),
  tokenBalance: gauge('token_balance', 'Balance of specific token for account', ['address', 'symbol']),
  tokenBalanceUSD: gauge('token_balance_usd', 'Balance of specific token for account in USD', ['address', 'symbol']),
  tokenBalanceTotal: gauge('token_balance_total_usd', 'Overall token balance for account in USD')
};

function scrape(services) {
  const address = process.env.CRYPTO_EXPORTER_ADDRESS || '';
  return services.http.request(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
}

function setMetric(metric, labels, value) {
  if (value) {
    metric.set(labels, value);
  }
}

function arrange(response) {
  const { address, ETH, countTxs, tokens } = response.body;

  setMetric(metrics.ethBalance, { address: address }, ETH.balance);
  setMetric(metrics.ethTotalIn, { address: address }, ETH.totalIn);
  setMetric(metrics.ethTotalOut, { address: address }, ETH.totalOut);
  setMetric(metrics.txnTotal, { address: address }, countTxs);

  let overallTokenBalanceUSD = 0;
  tokens.forEach(token => {
    const symbol = token.tokenInfo.symbol;
    const tokenBalanceUSD = token.tokenInfo.price ? (Number(token.balance) * token.tokenInfo.price.rate) / Number(`1e${token.tokenInfo.decimals}`) : 0;
    overallTokenBalanceUSD += tokenBalanceUSD;
    setMetric(metrics.tokenBalance, { address: address, symbol: symbol }, Number(token.balance) / Number(`1e${token.tokenInfo.decimals}`));
    setMetric(metrics.tokenBalanceUSD, { address: address, symbol: symbol }, Number(tokenBalanceUSD));
    setMetric(metrics.tokenHolderCount, { address: address, symbol: symbol }, Number(token.tokenInfo.holdersCount));
  });
  setMetric(metrics.tokenBalanceTotal, { address: address }, overallTokenBalanceUSD);

  console.log(`${new Date().toISOString()} - ethplorer metrics collected for ${process.env.CRYPTO_EXPORTER_ADDRESS}`);
}

function collect(services) {
  return scrape(services).then((response) => arrange(response));
}

module.exports = { collect };
