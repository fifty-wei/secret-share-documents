import { WalletClient } from "viem";

export default interface IWalletConfig {
  mnemonic?: string;
  client?: WalletClient;
}
