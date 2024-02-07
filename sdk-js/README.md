# Installation

## Download dependencies

``` bash
npm install
```

## Generate an Arweave wallet

``` bash
node -e "require('arweave').init({}).wallets.generate().then(JSON.stringify).then(console.log.bind(console))" > wallet.json
```

# Tests

``` bash
npm run test
```
