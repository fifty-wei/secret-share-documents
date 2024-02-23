# Installation

## Download dependencies

``` bash
npm install
```

## Environnement

Create a `.env` file with the following content:

``` bash
ENVIRONMENT= "mainnet" | "testnet" | "local"
```

## Tests

``` bash
npm run test
```

## How to

### Configure the client

``` js
const config = new Config();

// You can use your Wagmi wallet from client with:
const { data: walletClient } = useWalletClient();
config.useEvmWallet({
  client: walletClient
})

// Use the storage you prefer.
// By default FakeStorage is used.
config.useStorage(new FakeStorage()) // Do not store anything.
config.useStorage(new IpfsStorage()) // Store files on IPFS.
config.useStorage(new ArweaveStorage()) // Store files on Arweave.

// Initialize the client.
const client = new SecretDocumentClient(config);
```

### Store new document

``` js
const config = new Config();
const client = new SecretDocumentClient(config);
const res = await client.storeDocument().fromFile(file); // file must be of type File.
const res = await client.storeDocument().fromUrl('https://example.com/file.pdf');
```

### View documents

``` js
const config = new Config();
const client = new SecretDocumentClient(config);
// Retrieve all fileIds documents you have access to.
const res = await client.viewDocument().all();
// Get the content of a specific document.
const res = await client.viewDocument().get('fileId');
```
