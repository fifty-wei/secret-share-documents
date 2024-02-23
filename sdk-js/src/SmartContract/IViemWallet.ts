import { WalletClient } from "viem";

export default interface IViemWallet {
  mnemonic?: string;
  client?: WalletClient;
  privateKey?: `0x${string}`;
}
