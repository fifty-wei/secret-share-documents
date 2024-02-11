import path from "node:path";
import { Wallet } from "secretjs";
import PolygonToSecretAbi from "../src/abis/PolygonToSecret.json";
import IPolygonSmartContract from "../src/SmartContract/IPolygonSmartContract";
import ISecretNetworkSmartContract from "../src/SmartContract/ISecretNetworkSmartContract";
import SecretNetworkIntegration from "../src/SmartContract/SecretNetworkIntegration";

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
        address: "secret1lg6hf72tma667ryqhuxs9dfsg80yzz7gq66sj2",
        hash: "c6ac12674e76ff7a2d48e3fbac06bb937aab5f554a380b35e53119b182c28228",
      },
    },
  },
};

export async function getConfig(env: Environment): Promise<Config> {
  let tempConfig = config[env];

  if (env === Environment.LOCAL) {
    const wallet = new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
    const secretNetwork = new SecretNetworkIntegration({
      endpoint: tempConfig.chains.secretNetwork.endpoint,
      chainId: tempConfig.chains.secretNetwork.chainId,
      faucetEndpoint: tempConfig.chains.secretNetwork.faucetEndpoint,
      wallet: wallet,
    });
    await secretNetwork.fillUpFromFaucet(100_000_000);
    const contractPath = path.resolve(
      __dirname,
      "../../contract/contract.wasm",
    );
    const contract = await secretNetwork.initializeContract(contractPath);
    tempConfig.contracts.ShareDocument = {
      address: contract.address,
      hash: contract.hash,
    };
  }

  return tempConfig;
}
