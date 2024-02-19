import fs from "fs";
import { Wallet, SecretNetworkClient } from "secretjs";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";

interface Props {
  wallet: Wallet;
  endpoint: string;
  chainId: string;
  faucetEndpoint: string;
}

class SecretNetworkIntegration {
  wallet: Wallet;
  client: SecretNetworkClient;
  faucetEndpoint: string;

  constructor({ wallet, endpoint, chainId, faucetEndpoint }: Props) {
    this.wallet = wallet;
    this.faucetEndpoint = faucetEndpoint;
    this.client = new SecretNetworkClient({
      url: endpoint,
      chainId: chainId,
      wallet: this.wallet,
      walletAddress: this.wallet.address,
    });
  }

  async getFromFaucet() {
    return fetch(
      `${this.faucetEndpoint}/faucet?address=${this.client.address}`,
    );
  }

  async fillUpFromFaucet(targetBalance: number) {
    let balance = await this.getScrtBalance();
    while (Number(balance) < targetBalance) {
      try {
        await this.getFromFaucet();
      } catch (e) {
        console.error(`[ERROR] — Failed to get tokens from faucet: ${e}`);
      }
      balance = await this.getScrtBalance();
    }
  }

  async getScrtBalance(): Promise<string> {
    const response = await this.client.query.bank.balance({
      address: this.client.address,
      denom: "uscrt",
    });

    return response.balance!.amount!;
  }

  async initializeContract(
    contractPath: string,
  ): Promise<ISecretNetworkSmartContract> {
    const wasmCode = fs.readFileSync(contractPath);
    const uploadReceipt = await this.client.tx.compute.storeCode(
      {
        wasm_byte_code: wasmCode,
        sender: this.client.address,
        source: "",
        builder: "",
      },
      {
        gasLimit: 5_000_000,
      },
    );

    if (uploadReceipt.code !== 0) {
      console.log(
        `Failed to get code id: ${JSON.stringify(uploadReceipt.rawLog)}`,
      );
      throw new Error(`Failed to upload contract`);
    }

    const codeIdKv = uploadReceipt.jsonLog![0].events[0].attributes.find(
      (a: any) => {
        return a.key === "code_id";
      },
    );

    const code_id = Number(codeIdKv!.value);

    const { code_hash } = await this.client.query.compute.codeHashByCodeId({
      code_id: String(code_id),
    });

    const contract = await this.client.tx.compute.instantiateContract(
      {
        sender: this.client.address,
        code_id: code_id,
        code_hash: code_hash,
        init_msg: {},
        label: "secret-counter-" + Math.ceil(Math.random() * 10000), // The label should be unique for every contract, add random string in order to maintain uniqueness
      },
      {
        gasLimit: 1_000_000,
      },
    );

    if (contract.code !== 0) {
      throw new Error(
        `Failed to instantiate the contract with the following error ${contract.rawLog}`,
      );
    }

    const contract_address = contract.arrayLog!.find(
      (log) => log.type === "message" && log.key === "contract_address",
    )!.value;

    return {
      address: contract_address,
      hash: code_hash,
    };
  }

  getClient(): SecretNetworkClient {
    return this.client;
  }
}

export default SecretNetworkIntegration;
