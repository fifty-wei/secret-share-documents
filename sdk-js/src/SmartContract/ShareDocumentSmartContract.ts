import "dotenv/config";
import { Permit, SecretNetworkClient, Wallet } from "secretjs";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import { getConfig } from "../../config";
import { Chain } from "viem";

export type Address = `0x${string}`;

interface Props {
  chainId: string;
  client: SecretNetworkClient;
  contract: ISecretNetworkSmartContract;
  wallet: Wallet;
}

type PublicKey = {
  public_key: Array<number>;
};

class ShareDocumentSmartContract {
  private client: SecretNetworkClient;
  private contract: ISecretNetworkSmartContract;
  private wallet: Wallet;
  private chainId: string;

  constructor({ chainId, client, contract, wallet }: Props) {
    this.chainId = chainId;
    this.client = client;
    this.contract = contract;
    this.wallet = wallet;
  }

  async getPublicKey(): Promise<Uint8Array> {
    const res = (await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      code_hash: this.contract.hash,
      query: { get_contract_key: {} },
    })) as PublicKey;

    if ('err"' in res) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(res)}`,
      );
    }

    return Uint8Array.from(res.public_key);
  }

  async generatePermit(): Promise<Permit> {
    const config = await getConfig();
    return await this.client.utils.accessControl.permit.sign(
      this.wallet.address,
      this.chainId,
      "SHARE_DOCUMENT_PERMIT_" + Math.ceil(Math.random() * 10000), // Should be unique for every contract, add random string in order to maintain uniqueness
      [this.contract.address],
      ["owner"],
      false,
    );
  }

  async store(message: any) {
    return await this.client.tx.compute.executeContract(
      {
        sender: this.wallet.address,
        contract_address: this.contract.address,
        code_hash: this.contract.hash,
        msg: {
          receive_message_evm: message,
        },
      },
      {
        gasLimit: 100_000,
      },
    );
  }
}

export default ShareDocumentSmartContract;
