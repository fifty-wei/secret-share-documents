import PolygonToSecretAbi from "../src/abis/PolygonToSecret.json";
import IPolygonSmartContract from "../src/SmartContract/IPolygonSmartContract";
import ISecretNetworkSmartContract from "../src/SmartContract/ISecretNetworkSmartContract";

export enum Environment {
  MAINNET = "main",
  TESTNET = "test",
  LOCAL = "local",
}

interface Config {
  chains: {
    polygon: {
      chainId: number;
    };
    secretNetwork: {
      chainId: string;
      endpoint: string;
      faucetEndpoint: string;
    };
  };
  contracts: {
    PolygonToSecret: IPolygonSmartContract;
    ShareDocument: ISecretNetworkSmartContract;
  };
}

const config = {
  [Environment.LOCAL]: {
    chains: {
      secretNetwork: {
        chainId: "secretdev-1",
        endpoint: "http://localhost:1317",
        faucetEndpoint: "http://localhost:5000",
      },
    },
    contracts: {},
  },
  [Environment.TESTNET]: {
    chains: {
      polygon: {
        chainId: 80_001,
      },
      secretNetwork: {
        chainId: "pulsar-3",
        endpoint: "https://api.pulsar.scrttestnet.com",
        faucetEndpoint: "https://faucet.pulsar.scrttestnet.com",
      },
    },
    contracts: {
      PolygonToSecret: {
        address: "0x6DF893616680CaF051977D82CdcB4F6f66B2773d",
        abi: PolygonToSecretAbi,
      },
      ShareDocument: {
        address: "secret1k2uh472n6w8mrrz67uk7v3k06larkth3k09gjf",
        hash: "98ff54a9ee4d51c3463332734d3db0236441178e33d4d42f3224b682b638e902",
      },
    },
  },
};

export function getConfig(networkId: Environment): Config {
  return config[networkId];
}
