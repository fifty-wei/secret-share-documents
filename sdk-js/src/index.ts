import { SecretNetworkClient, Wallet } from "secretjs";
import ShareDocumentSmartContract from "./SmartContract/ShareDocumentSmartContract";
import ViemClient from "./SmartContract/ViemClient";
import StoreDocument from "./StoreDocument";
import IStorage from "./StoreDocument/Storage/IStorage";
import IConfig from "../config/IConfig";
import { getChain, getChainId } from "../config/chains";
import PolygonToSecretSmartContrat from "./SmartContract/PolygonToSecretSmartContract";
import IWalletConfig from "./SmartContract/IWalletConfig";

interface IShareDocumentConfig extends IConfig {
  evmWalletConfig: IWalletConfig;
}

interface Props {
  storage: IStorage;
  config: IShareDocumentConfig;
}

class ShareDocumentClient {
  private storage: IStorage;
  private config: IShareDocumentConfig;

  constructor({ storage, config }: Props) {
    this.storage = storage;
    this.config = config;
  }

  private polygonToSecret() {
    return new PolygonToSecretSmartContrat({
      secretContract: this.config.contracts.ShareDocument,
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
      url: this.config.chains.secretNetwork.endpoint,
      chainId: this.config.chains.secretNetwork.chainId,
      wallet: wallet,
      walletAddress: wallet.address,
    });
  }

  private viemClient() {
    return new ViemClient({
      chain: getChain(getChainId()),
      walletConfig: this.config.evmWalletConfig,
      contract: this.config.contracts.PolygonToSecret,
    });
  }

  private shareDocument() {
    if (!this.config) {
      throw new Error("Config not loaded. Please call getConfig() first.");
    }

    return new ShareDocumentSmartContract({
      chainId: this.config.chains.secretNetwork.chainId,
      client: this.secretNetworkClient(),
      wallet: this.secretNetworkWallet(),
      contract: this.config.contracts.ShareDocument,
    });
  }

  public storeDocument() {
    return new StoreDocument({
      storage: this.storage,
      shareDocument: this.shareDocument(),
      polygonToSecret: this.polygonToSecret(),
    });
  }
}

export default ShareDocumentClient;
