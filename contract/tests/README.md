# Secret Contract Integration Tests

This is an example of how to write integration tests in Typescript using `secret.js`.

The goal of integration tests is to test our contract on-chain, to test the integration between multiple transactions / queries and even to check the integration between multiple contracts.

## Prerequisites

- Install Node.js Long Term Support (LTS) [here](https://nodejs.org/en/download/).

## Install Dependencies

In order to run the tests first you will need to install the dependencies by running the following command:
```sh
npm install
```

## Build and Run Your Tests

After you have all of the dependencies installed you can run the following command in order to build and run your code:
```sh
npx ts-node [[ts_file_name.ts]]
```

You can also choose to debug your code by using the following steps (Using vscode):
1. Press `ctrl+shift+p`
2. Write `JavaScript Debug Terminal` and press `Enter`
3. In the new terminal you can run `npx ts-node [[ts_file_name.ts]]`
4. Your code will be running in debug mode and will stop on every breakpoint placed.

## Troubleshooting

If you are running Node.js 17 or later, you may encounter this error:

```
  opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
```

The error occurs because later versions of Node.js use OpenSSL3 which has a breaking change for the Message Digest (MD) family of cryptographic hash functions.

If you still want to use Node.js 17 or later, you can set the `NODE_OPTIONS` environment variable:

```
export NODE_OPTIONS=--openssl-legacy-provider
```
