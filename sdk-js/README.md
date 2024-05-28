# Installation

``` bash
npm i @secret-network/share-document
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
const ipfsStorage = new IpfsStorage({
    gateway: 'https://your-ipfs-node.tld/',
})
config.useStorage(ipfsStorage) // Store files on IPFS.
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
const res = await client.viewDocument().getAllFileIds();

// Get the content of a specific document.
const res = await client.viewDocument().download('fileId');
```

### Share documents

``` js
const config = new Config();
const client = new SecretDocumentClient(config);

// Get existing file access.
const res = await client.shareDocument('fileId').getFileAccess();

// Share viewing acces to a file.
const res = await client.shareDocument('fileId').addViewing(['secret1…']);

// Delete viewing access to a file, only the owner of the file can delete the access.
const res = await client.shareDocument('fileId').deleteViewing(['secret1…']);

// Transfer the ownership, only the actual owner can do this.
const res = await client.shareDocument('fileId').changeOwner('secret1…');

// All in one.
const res = await client.shareDocument('fileId').share({
    changeOwner: 'secret1…',
    addViewing: ['secret1…'],
    deleteViewing: ['secret1…'],
});
```
