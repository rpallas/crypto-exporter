const Got = require('got');
const Gauge = require('prom-client').Gauge;
const Pkg = require('../../package.json');

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

async function scrape() {
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

  metrics.ethBalance.set({ address: address }, ETH.balance);
  metrics.ethTotalIn.set({ address: address }, ETH.totalIn);
  metrics.ethTotalOut.set({ address: address }, ETH.totalOut);
  metrics.txnTotal.set({ address: address }, countTxs);

  let overallTokenBalanceUSD = 0;
  tokens.forEach(token => {
    const symbol = token.tokenInfo.symbol;
    const tokenBalanceUSD = token.tokenInfo.price ? (Number(token.balance) * token.tokenInfo.price.rate) / Number(`1e${token.tokenInfo.decimals}`) : 0;
    overallTokenBalanceUSD += tokenBalanceUSD;
    metrics.tokenBalance.set({ address: address, symbol: symbol }, Number(token.balance) / Number(`1e${token.tokenInfo.decimals}`));
    metrics.tokenBalanceUSD.set({ address: address, symbol: symbol }, Number(tokenBalanceUSD));
    metrics.tokenHolderCount.set({ address: address, symbol: symbol }, Number(token.tokenInfo.holdersCount));
  });
  metrics.tokenBalanceTotal.set({ address: address }, overallTokenBalanceUSD);

  console.log(`${new Date().toISOString()} - ethplorer metrics collected`);
}

function collect() {
  return scrape().then((response) => arrange(response));
}

module.exports = { collect };
