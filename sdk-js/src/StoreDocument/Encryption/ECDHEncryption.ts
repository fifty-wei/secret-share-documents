import { SecretNetworkClient, Wallet, TxResponse } from "secretjs";
import ISmartContract from "../../SmartContract/ISmartContract";

interface Props {
  wallet: Wallet;
  client: SecretNetworkClient,
  contract: ISmartContract;
}

interface PublicKey {
  public_key: Uint16Array;
}

class ECDHEncryption {

  client: SecretNetworkClient;
  contract: ISmartContract;
  wallet: Wallet;

  constructor({ client, wallet, contract }: Props) {
    this.client = client;
    this.contract = contract;
    this.wallet = wallet;
  }

  async generate(): Promise<TxResponse> {

    return await this.client.tx.compute.executeContract(
      {
        sender: this.wallet.address,
        contract_address: this.contract.address,
        msg: {
          create_keys: {},
        },
        code_hash: this.contract.hash,
      },
      { gasLimit: 2_000_000 }
    );
  }

  async getPublicKey(): Promise<Uint16Array> {
    const res = await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      query: {
        get_keys: {},
      },
      code_hash: this.contract.hash,
    }) as PublicKey;

    if ('err"' in res) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(res)}`
      );
    }

    return res.public_key;
  }
}

export default ECDHEncryption;
