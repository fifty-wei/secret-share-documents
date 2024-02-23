import { polygon, polygonMumbai } from "viem/chains";
import IConfig from "./IConfig";
import IPolygonSmartContract from "./SmartContract/IPolygonSmartContract";
import ISecretNetworkSmartContract from "./SmartContract/ISecretNetworkSmartContract";
import Environment from "./Environment";
import PolygonToSecretAbi from "./abis/PolygonToSecret.json";
import Network from "./Network";
import IStorage from "./StoreDocument/Storage/IStorage";
import IViemWallet from "./SmartContract/IViemWallet";
import ISecretNewtorkWallet from "./SmartContract/ISecretNewtorkWallet";
import FakeStorage from "./StoreDocument/Storage/FakeStorage";
import dotenv from "dotenv";

dotenv.config();

interface IClientConfig {
  chains: {
    polygon: {
      chainId: string;
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
  storage: IStorage;
  env: Environment;
  wallets: {
    secretNetwork: ISecretNewtorkWallet;
    polygon: IViemWallet;
  };
}

class Config {
  private config: IClientConfig;
  private env: Environment;

  constructor(config: Partial<IClientConfig> = {}) {
    const emptyConfig: IClientConfig = {
      storage: new FakeStorage(),
      env: Environment.LOCAL,
      contracts: {
        PolygonToSecret: {
          address: "",
          abi: PolygonToSecretAbi.abi,
        },
        ShareDocument: {
          address: "",
          hash: "",
        },
      },
      chains: {
        secretNetwork: {
          chainId: "",
          endpoint: "",
          faucetEndpoint: "", // Only need for SecretNetworkIntergration to fill up faucet. Maybe to be removed.
        },
        polygon: {
          chainId: "",
        },
      },
      wallets: {
        secretNetwork: {
          mnemonic: "",
        },
        polygon: {
          mnemonic: "",
        },
      },
    };
    this.env = config.env || Environment.LOCAL;
    this.config = {
      ...emptyConfig,
      ...this.defaultConfig(this.env),
      ...config,
    };
  }

  getEnv() {
    return this.env;
  }

  useStorage(storage: IStorage) {
    this.config.storage = storage;
  }

  getStorage(): IStorage {
    return this.config.storage;
  }

  getSecretNetwork() {
    return this.config.chains.secretNetwork;
  }

  getPolygon() {
    return this.config.chains.polygon;
  }

  getChainId(env: Environment = null): Network {
    let nodeEnv = this.env || Environment.LOCAL;

    if (env !== null) {
      nodeEnv = env;
    }

    switch (nodeEnv) {
      case Environment.LOCAL:
      case Environment.TESTNET:
        return Network.MUMBAI;
      case Environment.MAINNET:
        return Network.POLYGON;
    }
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

  defaultLocalConfig(): Partial<IClientConfig> {
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
          abi: PolygonToSecretAbi.abi,
        },
        ShareDocument: {
          address: "",
          hash: "",
        },
      },
      wallets: {
        secretNetwork: {
          mnemonic: process.env.SECRET_NETWORK_WALLET_MNEMONIC,
        },
        polygon: {
          mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
        },
      },
    };
  }

  defaultTestnetConfig(): Partial<IClientConfig> {
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
          abi: PolygonToSecretAbi.abi,
        },
        ShareDocument: {
          address: "secret1lg6hf72tma667ryqhuxs9dfsg80yzz7gq66sj2",
          hash: "c6ac12674e76ff7a2d48e3fbac06bb937aab5f554a380b35e53119b182c28228",
        },
      },
      wallets: {
        secretNetwork: {
          mnemonic: process.env.SECRET_NETWORK_WALLET_MNEMONIC,
        },
        polygon: {
          mnemonic: process.env.POLYGON_WALLET_MNEMONIC,
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

  useEvmWallet(wallet: IViemWallet) {
    this.config.wallets.polygon = wallet;
  }

  getEvmWallet(): IViemWallet {
    return this.config.wallets.polygon;
  }

  useSecretWallet(wallet: ISecretNewtorkWallet) {
    this.config.wallets.secretNetwork = wallet;
  }

  getSecretNetworkWallet(): ISecretNewtorkWallet {
    return this.config.wallets.secretNetwork;
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
