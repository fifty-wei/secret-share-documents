# Overview

This guide demonstrates how to leverage Secret Network's advanced blockchain-as-a-service capabilities. By integrating Secret Network with Polygon, users can execute contracts on Polygon while benefiting from Secret Network's privacy features. This approach ensures robust security on the primary blockchain while utilizing Secret Network for secure, external computations.

Our goal is to provide a secure method for sharing documents on the blockchain with designated recipients,Secret Network's technology solves the challenge of maintaining privacy when sharing on-chain documents, offering secure, encrypted document sharing within the blockchain ecosystem.

This project introduces an SDK that enables anyone to store and share confidential documents, harnessing the capabilities of Secret Network while operating on an EVM chain.

# Installation

## Download dependencies

```bash
npm i @secret-network/share-document
```

## Environnement

Create a `.env` file with the following content:

```bash
ENVIRONMENT= "mainnet" | "testnet" | "local"
```

> It indicates for the SDK which default configuration used. It defined alos the Axelar GMP parameter. Notice that Axelar GMP works as expected on mainnet, but there are some issues on testnet at the moment. 


# Configuration

## Storage strategies

In the SDK, you can choose between different storage strategies to store your documents. By default, the `FakeStorage` strategy is used, which does not store any data. You can also use the `IpfsStorage` strategy to store files on IPFS or the `Pinata` strategy to store files on Pinata.

If you want to add a new storage strategy, you can create a new class in the SDK that implements the [`IStorage` interface](https://github.com/fifty-wei/secret-share-documents/blob/main/sdk-js/src/StoreDocument/Storage/IStorage.ts) and then use it as configuration parameter when instanciate the SDK.

You can find the `Storage` strategies in the [`sdk-js/StoreDocument/Storage`](https://github.com/fifty-wei/secret-share-documents/tree/main/sdk-js/src/StoreDocument/Storage).

## Integration with Polygon contract

For this project, we have created a smart contract on Polygon that interacts with the Secret Network. The smart contract on Polygon manages message transfer to store a document on Secret Network. The smart contract sends a message to Axelar GMP, which bridges the message from the Polygon chain to the Secret Network chain, enabling the storage of confidential information.

You can find the smart contract in the [`polygon-secret/contract`](https://github.com/fifty-wei/secret-share-documents/blob/main/polygon-secret/contracts/PolygonToSecret.sol) folder. feel free to deploy your own contract on Polygon. then you can add the address of your contract in the [`sdk-js/src/Config.ts`](https://github.com/fifty-wei/secret-share-documents/blob/main/sdk-js/src/Config.ts) file. In our example, we have deploy a smart contract at this address `0xACE531E19D52DB4e485Ce894c6AfE53D60b59ca0`.

Note that this implementation is customizable. It can be used as a proof on Polygon to validate a process or other ideas you may have. Note that in our current implementation, anyone with another contract on Polygon can call the Secret smart contract through Axelar to store information. No checks are performed on the secret smart contract side to verify the original address from Polygon.


## Redeploying the Secret Network contract

In order to keep sensitive information (as the symmetric key used to decypher the data encrypted on IPFS), we are using Secret Network. You could use an existing smart contract by using the one deployed on this address `secret1kkjqnaw5gydcv68et6qdjemvld9xrp7ykqe2da` with the following hash `2bc9ba5f8e97b922f61f6466b340763da373d50a2884937f3f9084718ba9efd5` on `secret-4` mainnet.

Or if you want to modify/adapth the smart contract logic or if you want to redeploy this smart contract on your own, you can find it in the [`contract` folder](https://github.com/fifty-wei/secret-share-documents/tree/main/contract). Also, we provided a deployment script that you could use [here](https://github.com/fifty-wei/secret-share-documents/tree/main/contract/scripts).


# Configure the client

Here a sample on how to configure the SDK. We recommand to import it on your front end, as we did in the `Front end example` section. Notice in our front end example implementation, we have done relative import, as we wanted to have the last version of the SDK. If you want to have more info, check out our getting started section.

```js

import { Config, FakeStorage, IPFSStorage, SecretDocumentClient } from "@secret-network/share-document"

const config = new Config();

// You can use your Wagmi wallet from client with:
const { data: walletClient } = useWalletClient();
config.useEvmWallet({
  client: walletClient,
});

// Or, you can use a private key directly as 
config.useEvmWallet({
  privateKey: "0x..."
})


// Use the storage you prefer.
// By default FakeStorage is used.
config.useStorage(new FakeStorage()); // Do not store anything.
const ipfsStorage = new IPFSStorage({
  gateway: "https://your-ipfs-node.tld/",
});
config.useStorage(ipfsStorage); // Store files on IPFS.

// Create your own storage class and import it !
config.useStorage(new ArweaveStorage()); // Store files on Arweave.

// Initialize the client.
const client = new SecretDocumentClient(config);
```

## Front end example

You can find an example of how to store confidential documents in the [`front` folder](https://github.com/fifty-wei/secret-share-documents/tree/main/front). This example demonstrates how to store a document, view its content, and grant or revoke access to the document.

The Storage instanciation is done in [`front/src/context/index.tsx`](https://github.com/fifty-wei/secret-share-documents/blob/main/front/src/context/index.tsx). And more globally you can see how we configure and integrate in react the secret sharing document SDK in the [`front/src/context`](https://github.com/fifty-wei/secret-share-documents/tree/main/front/src/context).


## Getting started

To add this SDK to a new project, we can use a front end application as React / Vite / Angular... 
To begin with, we are going to create an app with wagmi by selecting React & Next. Then, we can install our secret storage package 

```bash
pnpm create wagmi
cd my_project
pnpm install
pnpm i @secret-network/share-document
```

Then, to use our SDK, you can modify the main page in `src/app/page.tsx`. First, you will need to import our SDK, and configure the connection with the wagmi wallet.

```ts

import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { Config, SecretDocumentClient, Environment, MetaMaskWallet } from "@secret-network/share-document";
import { useEffect, useState } from 'react';


function App() {
  ...

  // Defined wagmi wallet
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<SecretDocumentClient>();
  
  // Defined the SDK configuration
  let config = new Config({ env: Environment.MAINNET });

  // Create effect to retrieve and initialize user wallet for the SDK
  useEffect(() => {
    if (!walletClient) { return; }
    config.useEvmWallet({client: walletClient});
  }, [walletClient]);

  useEffect(() => {
    if (!address) { return; }
    const init = async () => {
      const wallet = await MetaMaskWallet.create(
        window.ethereum,
        address || ""
      );
      config.useSecretWallet(wallet);
      setClient(new SecretDocumentClient(config));
    };
    init();
  }, [address]);

  ...

  // Do what you want with the SDK
  // Here for the demo, we are going to retrive the list files stored by the user
  // when he has connected his wallet
  async function getFiles() {
    const filedIds = await client.viewDocument().getAllFileIds()
    console.log({ filedIds });
  }

  useEffect(() => {
    if (!client) { return; }
      getFiles();
  }, [client]);

  return (...)

}
```

Then, when the `page.tsx` is ready, you can run it with `pnpm run dev` and go to your web browser. 
Based on the previous code, when your metamask will be connected, you will have to sign a permits and see in the logs the files stored on Secret Network based on your address. 

Note: Do not forget to update `wagmi.ts` configuration. Indeed, by default, it is configure on ethereum and sepolia. However, in the SDK, we are using Polygon. You can modify it direclty inside the `wagmi.ts` file by adding Polygon configuration:

```ts
import { http, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [polygon], // Add Polygon chain
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'Create Wagmi' }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
  ],
  ssr: true,
  transports: {
    [polygon.id]: http(), // Add polygon chain
  },
})
...
```

# Features

The SDK provides the following features:

### Store new document

```js
import { Config, SecretDocumentClient } from "@secret-network/share-document"

const config = new Config();
const client = new SecretDocumentClient(config);
const res = await client.storeDocument().fromFile(file); // file must be of type File.
const res = await client
  .storeDocument()
  .fromUrl("https://example.com/file.pdf");
```

### View documents

```js
import { Config, SecretDocumentClient } from "@secret-network/share-document"

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
