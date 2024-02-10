import "dotenv/config";
import { Permit, SecretNetworkClient, Wallet } from "secretjs";
import ISmartContract from "./ISmartContract";

export type Address = `0x${string}`;

interface Props {
  client: SecretNetworkClient;
  contract: ISmartContract;
  wallet: Wallet;
}

type PublicKey = {
  public_key: Array<number>;
};

class ShareDocumentSmartContract {
  private client: SecretNetworkClient;
  private contract: ISmartContract;
  private wallet: Wallet;

  constructor({ client, contract, wallet }: Props) {
    this.client = client;
    this.contract = contract;
    this.wallet = wallet;
  }

  async getPublicKey() {
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

    return res.public_key;
  }

  async generatePermit(): Promise<Permit> {
    return await this.client.utils.accessControl.permit.sign(
      this.wallet.address,
      process.env.SECRET_NETWORK_CHAIN_ID as string,
      "SHARE_DOCUMENT_PERMIT_" + Math.ceil(Math.random() * 10000), // Should be unique for every contract, add random string in order to maintain uniqueness
      [this.contract.address],
      ["owner"],
      false,
    );
  }
}

export default ShareDocumentSmartContract;
