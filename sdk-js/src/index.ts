import { SecretNetworkClient, Wallet } from "secretjs";
import ShareDocumentSmartContract from "./SmartContract/ShareDocumentSmartContract";
import ViemClient from "./SmartContract/ViemClient";
import StoreDocument from "./StoreDocument";
import IStorage from "./StoreDocument/Storage/IStorage";
import Config from "./Config";
import { getChain, getChainId } from "../config/chains";
import PolygonToSecretSmartContrat from "./SmartContract/PolygonToSecretSmartContract";
import IWalletConfig from "./SmartContract/IWalletConfig";

// interface IShareDocumentConfig extends IConfig {
//   evmWalletConfig: IWalletConfig;
// }

class ShareDocumentClient {
  private storage: IStorage;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private polygonToSecret() {
    return new PolygonToSecretSmartContrat({
      secretContract: this.config.getShareDocument(),
      viemClient: this.viemClient(),
    });
  }

  private secretNetworkWallet() {
    return new Wallet(process.env.SECRET_NETWORK_WALLET_MNEMONIC);
  }

  private secretNetworkClient() {
    if (!this.config) {
      throw new Error("Config not loaded. Please call getConfig() first.");
    }

    const wallet = this.secretNetworkWallet();
    return new SecretNetworkClient({
      url: this.config.getSecretNetwork().endpoint,
      chainId: this.config.getSecretNetwork().chainId,
      wallet: wallet,
      walletAddress: wallet.address,
    });
  }

  private viemClient() {
    return new ViemClient({
      chain: this.config.getChain(this.config.getChainId()),
      walletConfig: this.config.getWallet(),
      contract: this.config.getPolygonToSecret(),
    });
  }

  private shareDocument() {
    if (!this.config) {
      throw new Error("Config not loaded. Please call getConfig() first.");
    }

    return new ShareDocumentSmartContract({
      chainId: this.config.getSecretNetwork().chainId,
      client: this.secretNetworkClient(),
      wallet: this.secretNetworkWallet(),
      contract: this.config.getShareDocument(),
    });
  }

  public storeDocument() {
    return new StoreDocument({
      storage: this.config.getStorage(),
      shareDocument: this.shareDocument(),
      polygonToSecret: this.polygonToSecret(),
    });
  }
}

export default ShareDocumentClient;
