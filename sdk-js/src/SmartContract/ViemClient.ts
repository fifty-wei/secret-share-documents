import {
  Chain,
  PublicClient,
  Transport,
  WalletClient,
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import IPolygonSmartContract from "./IPolygonSmartContract";
import IWalletConfig from "./IWalletConfig";

interface Props {
  chain: Chain;
  walletConfig: IWalletConfig;
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

  public setupWallet(config: IWalletConfig) {
    if (config?.mnemonic) {
      const account = mnemonicToAccount(config.mnemonic);
      return createWalletClient({
        account: account,
        chain: this.chain,
        transport: http(),
      });
    }

    if (config?.client) {
      return config.client;
    }

    return createWalletClient({
      chain: this.chain,
      transport: http(),
    });
  }

  public async writeContract({
    functionName,
    args,
    value,
  }: WriteContractProps) {
    const [address] = await this.walletClient.getAddresses();

    if (!address) {
      throw Error(
        "Wallet Client not initialised. Please provide a valid mnemonic or client.",
      );
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
}

export default ViemClient;
