
# Deploy Smart contract

First install the dependencies.

```bash
npm i
```

Then, do a copy of the `.env.example` to `.env` and add your `MNEMONIC`. 

Then, update the `SecretNetworkClient` parameter in `deploy.js` to match the chain where you want to deploy your smart contract. Here, we are going to deploy it on the testnet:

- chainId: "pulsar-3",
- url: "https://api.pulsar.scrttestnet.com",

Then, execute the `deploy.js` script.

```bash
node deploy.js
```


## Implementation deployed

We have deploy our smart contract on the testnet. Here are the parameters used:

Network info:
- chainId: "pulsar-3",
- url: "https://api.pulsar.scrttestnet.com",
  
Deploy contract
- codeId:  4890
- Contract hash: 28aa8b90638e8f47240695b4f0c4a027f7e2991373c618da6d3d8b1daf7dbc0a

Contract address:
> secret14tplljk8wjezkya2jcx2ynjx5udue8uj69f75q

> Transaction: https://testnet.ping.pub/secret/tx/B0FF5B3C89EE1911557608FF5950AEA46511E2DDAA36EB547FF94268BFA47009


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