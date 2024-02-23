import { SecretNetworkClient, Wallet } from "secretjs";
import SecretDocumentSmartContract from "./SmartContract/SecretDocumentSmartContract";
import ViemClient from "./SmartContract/ViemClient";
import StoreDocument from "./StoreDocument";
import Config from "./Config";
import PolygonToSecretSmartContrat from "./SmartContract/PolygonToSecretSmartContract";
import ViewDocument from "./ViewDocument";

class SecretDocumentClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;

    console.log({ config });
  }

  private polygonToSecret() {
    return new PolygonToSecretSmartContrat({
      secretContract: this.config.getShareDocument(),
      viemClient: this.viemClient(),
    });
  }

  private secretNetworkWallet() {
    return new Wallet(this.config.getSecretNetworkWallet().mnemonic);
  }

  private secretNetworkClient() {
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
      walletConfig: this.config.getEvmWallet(),
      contract: this.config.getPolygonToSecret(),
    });
  }

  private shareDocument() {
    if (!this.config) {
      throw new Error("Config not loaded. Please call getConfig() first.");
    }

    return new SecretDocumentSmartContract({
      chainId: this.config.getSecretNetwork().chainId,
      client: this.secretNetworkClient(),
      wallet: this.secretNetworkWallet(),
      contract: this.config.getShareDocument(),
    });
  }

  /**
   * Use cases
   */
  public storeDocument() {
    return new StoreDocument({
      storage: this.config.getStorage(),
      secretDocument: this.shareDocument(),
      polygonToSecret: this.polygonToSecret(),
    });
  }

  public viewDocument() {
    return new ViewDocument({
      secretDocument: this.shareDocument(),
    });
  }
}

export default SecretDocumentClient;
