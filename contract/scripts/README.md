
# Deploy Smart contract

First install the dependencies.

```bash
npm i
```

Then, do a copy of the `.env.example` to `.env` and add your `MNEMONIC`. 

You can select to deploy the smart contract on `mainnet` or `testnet` by specifying it in the `.env`. Or you can also update our `deploy.js` script to match your implementation. 

Then, execute the `deploy.js` script.

```bash
node deploy.js
```


## Implementation deployed

Network info:
- chainId: "secret-4",
  
Deploy contract
- codeId:  1683
- Contract hash: 2bc9ba5f8e97b922f61f6466b340763da373d50a2884937f3f9084718ba9efd5

We deploy our smart contract on mainnet at this address: 
> secret1kkjqnaw5gydcv68et6qdjemvld9xrp7ykqe2da
> See on mintscan: https://www.mintscan.io/secret/address/secret1kkjqnaw5gydcv68et6qdjemvld9xrp7ykqe2da


## References:

- https://docs.scrt.network/secret-network-documentation/overview-ecosystem-and-technology/secret-network-overview/testnet
- https://docs.scrt.network/secret-network-documentation/development/getting-started/interacting-with-the-testnet


## Notes

When running the docker to optimize the smart contract size, it seems that the function `is_some_and` is not stable. I assume that the container used to optimize it, runs with an older version of rust. 
This will be a problem if we want to minimize the fees.

```
docker run --rm -v "$(pwd)":/contract \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  enigmampc/secret-contract-optimizer  
```