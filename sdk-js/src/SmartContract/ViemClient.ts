import {
  Chain,
  PublicClient,
  Transport,
  WalletClient,
  createPublicClient,
  createWalletClient,
  http,
  HDAccount,
  PrivateKeyAccount,
  parseGwei,
  formatGwei,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import IPolygonSmartContract from "./IPolygonSmartContract";
import IViemWallet from "./IViemWallet";

interface Props {
  chain: Chain;
  walletConfig: IViemWallet;
  contract: IPolygonSmartContract;
}

interface WriteContractProps {
  functionName: string;
  args: Array<any>;
  value?: bigint;
}

class ViemClient {
  chain: Chain;
  walletClient: WalletClient;
  publicClient: PublicClient<Transport, Chain>;
  contract: IPolygonSmartContract;

  constructor({ chain, walletConfig, contract }: Props) {
    this.chain = chain;
    this.contract = contract;
    this.walletClient = this.setupWallet(walletConfig);
    this.publicClient = createPublicClient<Transport, Chain>({
      chain: this.chain,
      transport: http(),
    });
  }

  getContract() {
    return this.contract;
  }

  public setupWallet(config: IViemWallet) {
    /**
     * EVM Wallet
     */
    if (config?.client) {
      return config.client;
    }

    /**
     * Local Account
     * @see https://viem.sh/docs/clients/wallet#local-accounts-private-key-mnemonic-etc
     */
    if (config?.mnemonic) {
      return this.createWalletWithAccount(mnemonicToAccount(config.mnemonic));
    }

    if (config?.privateKey) {
      return this.createWalletWithAccount(
        privateKeyToAccount(config.privateKey)
      );
    }
  }

  public createWalletWithAccount(account: PrivateKeyAccount | HDAccount) {
    return createWalletClient({
      account: account,
      chain: this.chain,
      transport: http(),
    });
  }

  public async writeContract({
    functionName,
    args,
    value,
  }: WriteContractProps) {
    if (!this.walletClient) {
      throw Error(
        "Wallet Client not initialised. Please provide a valid mnemonic or client."
      );
    }

    const [address] = await this.walletClient.getAddresses();

    if (!address) {
      throw Error("No Address found.");
    }

    // @ts-ignore
    const { request } = await this.publicClient.simulateContract({
      address: this.contract.address as `0x${string}`,
      abi: this.contract.abi,
      functionName: functionName,
      args: args,
      account: address,
      value: value,
    });

    return this.walletClient.writeContract(request);
  }

  parseGwei(value): bigint {
    return formatGwei(parseGwei(value));
  }
}

export default ViemClient;
