# Installation

## Download dependencies

``` bash
npm install
```

## Generate an Arweave wallet

``` bash
node -e "require('arweave').init({}).wallets.generate().then(JSON.stringify).then(console.log.bind(console))" > wallet.json
```

## Environnement

Create a `.env` file with the following content:

``` bash
ENVIRONMENT= "mainnet" | "testnet" | "local"

SECRET_NETWORK_ENDPOINT=
SECRET_NETWORK_FAUCET_ENDPOINT=
SECRET_NETWORK_CHAIN_ID=
```

## Tests

``` bash
npm run test
```
