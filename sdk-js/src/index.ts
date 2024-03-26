import { SecretNetworkClient, Wallet } from "secretjs";
import SecretDocumentSmartContract from "./SmartContract/SecretDocumentSmartContract";
import ViemClient from "./SmartContract/ViemClient";
import AxelarClient from "./SmartContract/AxelarClient";
import Config from "./Config";
import PolygonToSecretSmartContrat from "./SmartContract/PolygonToSecretSmartContract";
import StoreDocument from "./StoreDocument";
import ViewDocument from "./ViewDocument";
import ShareDocument from "./ShareDocument";

class SecretDocumentClient {
  private readonly config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private polygonToSecret() {
    return new PolygonToSecretSmartContrat({
      axelarClient: this.axelarClient(),
      secretContract: this.config.getShareDocument(),
      viemClient: this.viemClient(),
    });
  }

  private axelarClient() {
    return new AxelarClient({
      env: this.config.getEnv(),
    });
  }

  private secretNetworkWallet() {
    return this.config.getSecretNetworkWallet();
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

  private secretDocument() {
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
      secretDocument: this.secretDocument(),
      polygonToSecret: this.polygonToSecret(),
    });
  }

  public viewDocument() {
    return new ViewDocument({
      // storage: this.config.getStorage(),
      secretDocument: this.secretDocument(),
    });
  }

  public shareDocument(fileId: string) {
    const shareDocument = new ShareDocument({
      secretDocument: this.secretDocument(),
      polygonToSecret: this.polygonToSecret(),
    });

    return shareDocument.setFileId(fileId);
  }
}

export default SecretDocumentClient;
