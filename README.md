# Crypto Exporter

A prometheus exporter for cryptocurrencies.

Contains several collectors that scrape cryptocurrency data from a variety of sources.

 * The [Ethplorer api](https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API) is used to get ethereum blockchain data about an account (configurable)
 * The [CoinMarketCap api](https://coinmarketcap.com/api/) is used to get ticker information about crypto currencies

## Usage

```bash
cd prometheus-compose
export CRYPTO_EXPORTER_ADDRESS='your-ethereum-address'
docker-compose up
```

## Development

```bash
docker build -t rpallas/crypto-exporter:latest . && docker run --rm -p 9101:9101 -p 3000:3000 -e CRYPTO_EXPORTER_ADDRESS='your-ethereum-address' rpallas/crypto-exporter:latest
```
