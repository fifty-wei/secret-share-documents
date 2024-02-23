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

## How to use

### Store a document

``` bash
const client = new SecretDocumentClient();
const res = await client.storeDocument().fromFile(file); // file must be of type File.
const res = await client.storeDocument().fromUrl('https://example.com/file.pdf');
```

### View a document

``` bash
const client = new SecretDocumentClient();
// Retrieve all fileIds documents you have access to.
const res = await client.viewDocument().all();
// Get the content of a specific document.
const res = await client.viewDocument().get('fileId');
```
