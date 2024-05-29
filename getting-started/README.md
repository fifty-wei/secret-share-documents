# Overview

This guide demonstrates how to leverage Secret Network's advanced blockchain-as-a-service capabilities. By integrating Secret Network with Polygon, users can execute contracts on Polygon while benefiting from Secret Network's privacy features. This approach ensures robust security on the primary blockchain while utilizing Secret Network for secure, external computations.

Our goal is to provide a secure method for sharing documents on the blockchain with designated recipients,Secret Network's technology solves the challenge of maintaining privacy when sharing on-chain documents, offering secure, encrypted document sharing within the blockchain ecosystem.

This project introduces an SDK that enables anyone to store and share confidential documents, harnessing the capabilities of Secret Network while operating on an EVM chain.

# Installation

## Download dependencies

```bash
npm install
```

## Environnement

Create a `.env` file with the following content:

```bash
ENVIRONMENT= "mainnet" | "testnet" | "local"
```

# Configuration

## Storage strategies

In the SDK, you can choose between different storage strategies to store your documents. By default, the `FakeStorage` strategy is used, which does not store any data. You can also use the `IpfsStorage` strategy to store files on IPFS or the `Pinata` strategy to store files on Pinata.

If you want to add a new storage strategy, you can create a new class that implements the `Storage` interface IStorage.
You can find the `Storage` strategies in the sdk-js/StoreDocument/Storage.

## Integration with Polygon contract

For this project, we have created a smart contract on Polygon that interacts with the Secret Network. The smart contract on Polygon manages the process of storing and retrieving documents on Secret Network. The smart contract sends a message to Axelar GMP, which bridges the message from the Polygon chain to the Secret Network chain, enabling the storage of confidential information.

You can find the smart contract in the polygon-secret/contract folder. feel free to deploy your own contract on Polygon. then you can add the address of your contract in the sdk-js/Config.ts file.

## Redeploying the Secret Network contract

In order to keep sensitive information (as the symmetric key used to decypher the data encrypted on IPFS), we are using Secret Network. You could use an existing smart contract by using the one deployed on this address `secret1kkjqnaw5gydcv68et6qdjemvld9xrp7ykqe2da` with the following hash `2bc9ba5f8e97b922f61f6466b340763da373d50a2884937f3f9084718ba9efd5` on `secret-4` mainnet.

Or if you want to modify/adapth the smart contract logic or if you want to redeploy this smart contract on your own, you can find it in the [`contract` folder](https://github.com/fifty-wei/secret-share-documents/tree/main/contract). Also, we provided a deployment script that you could use [here](https://github.com/fifty-wei/secret-share-documents/tree/main/contract/scripts).


# Configure the client

```js
const config = new Config();

// You can use your Wagmi wallet from client with:
const { data: walletClient } = useWalletClient();
config.useEvmWallet({
  client: walletClient,
});

// Use the storage you prefer.
// By default FakeStorage is used.
config.useStorage(new FakeStorage()); // Do not store anything.
const ipfsStorage = new IpfsStorage({
  gateway: "https://your-ipfs-node.tld/",
});
config.useStorage(ipfsStorage); // Store files on IPFS.
config.useStorage(new ArweaveStorage()); // Store files on Arweave.

// Initialize the client.
const client = new SecretDocumentClient(config);
```

## Front end example

You can find an example of how to store confidential documents in the front folder. This example demonstrates how to store a document, view its content, and grant or revoke access to the document.

The Storage instanciation is done in the xxxxxxxxxxxxxxxxxxx.

# Features

The SDK provides the following features:

### Store new document

```js
const config = new Config();
const client = new SecretDocumentClient(config);
const res = await client.storeDocument().fromFile(file); // file must be of type File.
const res = await client
  .storeDocument()
  .fromUrl("https://example.com/file.pdf");
```

### View documents

```js
const config = new Config();
const client = new SecretDocumentClient(config);

// Retrieve all fileIds documents you have access to.
const res = await client.viewDocument().getAllFileIds();

// Get the content of a specific document.
const res = await client.viewDocument().download("fileId");
```

### Share documents

```js
const config = new Config();
const client = new SecretDocumentClient(config);

// Get existing file access.
const res = await client.shareDocument("fileId").getFileAccess();

// Share viewing acces to a file.
const res = await client.shareDocument("fileId").addViewing(["secret1…"]);

// Delete viewing access to a file, only the owner of the file can delete the access.
const res = await client.shareDocument("fileId").deleteViewing(["secret1…"]);

// Transfer the ownership, only the actual owner can do this.
const res = await client.shareDocument("fileId").changeOwner("secret1…");

// All in one.
const res = await client.shareDocument("fileId").share({
  changeOwner: "secret1…",
  addViewing: ["secret1…"],
  deleteViewing: ["secret1…"],
});
```
