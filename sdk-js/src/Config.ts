import { Chain, polygon, polygonMumbai } from "viem/chains";
import IConfig from "./IConfig";
import IWalletConfig from "./SmartContract/IWalletConfig";
import IPolygonSmartContract from "./SmartContract/IPolygonSmartContract";
import ISecretNetworkSmartContract from "./SmartContract/ISecretNetworkSmartContract";
import Environment from "./Environment";
import PolygonToSecretAbi from "./abis/PolygonToSecret.json";
import Network from "./Network";

const ENVIRONMENT =
  (process.env.ENVIRONMENT as Environment) || Environment.LOCAL;

class Config {
  private config: Partial<IConfig>;

  constructor(config: Partial<IConfig> = {}) {
    this.config = {
      ...this.defaultConfig(ENVIRONMENT),
      ...config,
    };
  }

  getSecretNetwork() {
    return this.config.chains.secretNetwork;
  }

  getPolygon() {
    return this.config.chains.secretNetwork;
  }

  getChain(networkId: Network) {
    const chains = {
      [Network.MUMBAI]: polygonMumbai,
      [Network.POLYGON]: polygon,
    };

    if (!networkId) {
      throw new Error(`Network ID needed`);
    }

    const chainKey = Object.keys(chains).find(
      (key) => key === networkId.toString(),
    );

    if (!chainKey) {
      throw new Error(`Chain ${networkId} not found`);
    }

    return chains[chainKey as keyof typeof Network];
  }

  defaultLocalConfig(): Partial<IConfig> {
    return {
      chains: {
        secretNetwork: {
          chainId: "secretdev-1",
          endpoint: "http://localhost:1317",
          faucetEndpoint: "http://localhost:5000",
        },
        polygon: {
          chainId: Network.MUMBAI.toString(),
        },
      },
      contracts: {
        PolygonToSecret: {
          address: "",
          abi: PolygonToSecretAbi,
        },
        ShareDocument: {
          address: "",
          hash: "",
        },
      },
    };
  }

  defaultTestnetConfig(): Partial<IConfig> {
    return {
      chains: {
        secretNetwork: {
          chainId: "pulsar-3",
          endpoint: "https://api.pulsar.scrttestnet.com",
          faucetEndpoint: "https://faucet.pulsar.scrttestnet.com",
        },
        polygon: {
          chainId: Network.MUMBAI.toString(),
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
    };
  }

  private defaultConfig(env: Environment): Partial<IConfig> {
    switch (env) {
      case Environment.LOCAL:
        return this.defaultLocalConfig();
      case Environment.TESTNET:
        return this.defaultTestnetConfig();
    }
  }

  useWallet(wallet: IWalletConfig) {
    this.config.wallet = wallet;
  }

  getWallet(): IWalletConfig {
    return this.config.wallet;
  }

  usePolygonToSecret(contract: IPolygonSmartContract) {
    this.config.contracts.PolygonToSecret = contract;
  }

  getPolygonToSecret(): IPolygonSmartContract {
    return this.config.contracts.PolygonToSecret;
  }

  useShareDocument(contract: ISecretNetworkSmartContract) {
    this.config.contracts.ShareDocument = contract;
  }

  getShareDocument(): ISecretNetworkSmartContract {
    return this.config.contracts.ShareDocument;
  }
}

export default Config;
