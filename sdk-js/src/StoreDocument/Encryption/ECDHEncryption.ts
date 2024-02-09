import { SecretNetworkClient, Wallet, TxResponse } from "secretjs";
import ISmartContract from "../../SmartContract/ISmartContract";

interface Props {
  wallet: Wallet;
  chainId: string;
  endpoint: string;
  contract: ISmartContract;
}

class ECDHEncryption {

  client: SecretNetworkClient;
  contract: ISmartContract;
  wallet: Wallet;

  constructor({ wallet, chainId, endpoint, contract }: Props) {
    this.client = new SecretNetworkClient({
      chainId: chainId,
      url: endpoint,
      wallet: wallet,
      walletAddress: wallet.address,
    });
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

  async getKeys() {
    return await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      query: {
        get_keys: {},
      },
      code_hash: this.contract.hash,
    });
  }
}

export default ECDHEncryption;
