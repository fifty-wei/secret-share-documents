import { SecretNetworkClient } from "secretjs";
import { Contract } from "./SecretNetworkIntegration";

export type Address = `0x${string}`;

interface Props {
  client: SecretNetworkClient,
  contract: Contract
}

type PublicKey = {
  public_key: Array<number>;
};

class ShareDocumentSmartContract {

  private client: SecretNetworkClient;
  private contract: Contract;

  constructor({
    client,
    contract
  }: Props) {
    this.client = client;
    this.contract = contract;
  }

  async getPublicKey() {
    const res = (await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      code_hash: this.contract.hash,
      query: { get_contract_key: {} },
    })) as PublicKey;

    if ('err"' in res) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(res)}`
      );
    }

    return res.public_key;
  }
}

export default ShareDocumentSmartContract;
