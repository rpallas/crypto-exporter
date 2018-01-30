const Got = require('got');
const Gauge = require('prom-client').Gauge;
const Pkg = require('../package.json');

function gauge(name, help, labels=['address']) {
  return new Gauge({ name: `ethplorer_account_${name}`, help: help, labelNames: labels })
}

const ethBalanceGauge = gauge('eth_balance', 'Total balance of either in account');
const ethTotalInGauge = gauge('eth_totalIn', 'Total either transferred into account');
const ethTotalOutGauge = gauge('eth_totalOut', 'Total either transferred out of account');
const txnTotalGauge = gauge('txn_total', 'Total number of transactons for account');
const tokenBalanceGauge = gauge('token_balance_usd', 'Overall token balance for account');
const tokenGauges = {};

async function aquire() {
  const address = process.env.CRYPTO_EXPORTER_ADDRESS || '';
  const requestOptions = {
    json: true,
    headers: { 'user-agent': `crypto-exporter/${Pkg.version}` }
  };
  try {
    return await Got(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`, requestOptions);
  } catch (error) {
    console.log(`Ethplorer api request error: ${error}`);
  }
}

function arrange(response) {
  const { address, ETH, countTxs, tokens } = response.body;

  ethBalanceGauge.set({ address: address }, ETH.balance);
  ethTotalInGauge.set({ address: address }, ETH.totalIn);
  ethTotalOutGauge.set({ address: address }, ETH.totalOut);
  txnTotalGauge.set({ address: address }, countTxs);

  let overallTokenBalanceUSD = 0;
  tokens.forEach(token => {
    const symbol = token.tokenInfo.symbol;
    const tokenBalanceUSD = token.tokenInfo.price ? (Number(token.balance) * token.tokenInfo.price.rate) / Number(`1e${token.tokenInfo.decimals}`) : 0;
    overallTokenBalanceUSD += tokenBalanceUSD;
    const tokenBalanceName = `token_${symbol}_balance`;
    if (!tokenGauges[tokenBalanceName]) {
      tokenGauges[tokenBalanceName] = gauge(tokenBalanceName, `Balance of ${symbol} for account`, ['address', 'symbol']);
    }
    tokenGauges[tokenBalanceName].set({ address: address, symbol: symbol }, Number(token.balance) / Number(`1e${token.tokenInfo.decimals}`));
    if (!tokenGauges[`${tokenBalanceName}_usd`]) {
      tokenGauges[`${tokenBalanceName}_usd`] = gauge(`${tokenBalanceName}_usd`, `Balance of ${symbol} in USD for account`, ['address', 'symbol']);
    }
    tokenGauges[`${tokenBalanceName}_usd`].set({ address: address, symbol: symbol }, tokenBalanceUSD);
  });
  tokenBalanceGauge.set({ address: address }, overallTokenBalanceUSD);

  console.log(`${new Date().toISOString()} - ethplorer metrics collected`);
}

function collect() {
  return aquire().then((response) => arrange(response));
}

module.exports = { collect };
