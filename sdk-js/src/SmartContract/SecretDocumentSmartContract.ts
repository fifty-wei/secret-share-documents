import { Permit, SecretNetworkClient, TxResponse, Wallet } from "secretjs";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import SecretDocumentQueryFactory from "./SecretDocumentQueryFactory";
import {
  GetFileContentResponse,
  GetFileIdsResponse,
  PublicKeyResponse,
} from "./IQueryResponse";
import SecretDocumentExecuteFactory from "./SecretDocumentExecuteFactory";
import ECDHEncryption from "../Encryption/ECDHEncryption";
import IEncryptedData from "../Encryption/IEncryptedData";
import {
  ExecutePayload,
  IContractPayload,
  IExecutePayload,
  IQueryPayload,
  IReceiveMessageEvm,
  QueryPayload,
} from "./IQueryPayload";

export type Address = `0x${string}`;

interface Props {
  chainId: string;
  client: SecretNetworkClient;
  contract: ISecretNetworkSmartContract;
  wallet: Wallet;
}

interface ExecuteWithPermitPayload<T> {
  with_permit: {
    permit: Permit;
    execute: T;
  };
}

interface QueryWithPermitPayload<T> {
  with_permit: {
    permit: Permit;
    query: T;
  };
}

type PayloadWithPermit<T> =
  | ExecuteWithPermitPayload<T>
  | QueryWithPermitPayload<T>;

// type WithPermitPayload<T> =
//   | QueryWithPermitPayload<T>
//   | ExecuWithPermittePayload<T>;

class SecretDocumentSmartContract {
  private client: SecretNetworkClient;
  private contract: ISecretNetworkSmartContract;
  private wallet: Wallet;
  private chainId: string;
  private queryFactory: SecretDocumentQueryFactory;
  private executeFactory: SecretDocumentExecuteFactory;

  constructor({ chainId, client, contract, wallet }: Props) {
    this.chainId = chainId;
    this.client = client;
    this.contract = contract;
    this.wallet = wallet;
    this.queryFactory = new SecretDocumentQueryFactory();
    this.executeFactory = new SecretDocumentExecuteFactory();
  }

  getExecuteFactory() {
    return this.executeFactory;
  }

  getWallet() {
    return this.wallet;
  }

  async getPublicKey(): Promise<Uint8Array> {
    const res = (await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      code_hash: this.contract.hash,
      query: this.queryFactory.getContractKey(),
    })) as PublicKeyResponse;

    if ('err"' in res) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(res)}`,
      );
    }

    return Uint8Array.from(res.public_key);
  }

  async findAll(): Promise<Array<string>> {
    const query = this.queryFactory.getFileIds();
    const queryWithPermit = await this.wrapPayloadWithPermit(
      this.queryFactory.query(query),
    );
    const res = (await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      code_hash: this.contract.hash,
      query: queryWithPermit,
    })) as GetFileIdsResponse;

    if (!res?.file_ids) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(res)}`,
      );
    }

    return res.file_ids;
  }

  async getFile(fileId: string): Promise<{ url: string; symmetricKey: any }> {
    const payload = this.queryFactory.getFileContent(fileId);
    const queryWithPermit = await this.wrapPayloadWithPermit(
      this.queryFactory.query(payload),
    );
    const res = (await this.client.query.compute.queryContract({
      contract_address: this.contract.address,
      code_hash: this.contract.hash,
      query: queryWithPermit,
    })) as GetFileContentResponse;

    if (!res?.payload) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(res)}`,
      );
    }

    return JSON.parse(res.payload);
  }

  async generatePermit(): Promise<Permit> {
    return await this.client.utils.accessControl.permit.sign(
      this.wallet.address,
      this.chainId,
      "SECRET_DOCUMENT_PERMIT_" + Math.ceil(Math.random() * 10000), // Should be unique for every contract, add random string in order to maintain uniqueness
      [this.contract.address],
      ["owner"],
      false,
    );
  }

  async receiveMessageEvm(message: IReceiveMessageEvm): Promise<TxResponse> {
    return await this.client.tx.compute.executeContract(
      {
        sender: this.wallet.address,
        contract_address: this.contract.address,
        code_hash: this.contract.hash,
        msg: this.executeFactory.receiveMessageEvm(message),
      },
      {
        gasLimit: 100_000,
      },
    );
  }

  /**
   * Alias
   */
  async store(message: IReceiveMessageEvm): Promise<TxResponse> {
    return this.receiveMessageEvm(message);
  }

  /**
   * Alias
   */
  async share(message: IReceiveMessageEvm): Promise<TxResponse> {
    return this.receiveMessageEvm(message);
  }

  async wrapPayloadWithPermit<T extends IContractPayload>(
    payload: IExecutePayload<ExecutePayload> | IQueryPayload<QueryPayload>,
  ): Promise<PayloadWithPermit<T>> {
    const permit = await this.generatePermit();

    return {
      with_permit: {
        permit: permit,
        ...(payload as any),
      },
    };
  }

  async encryptPayload<T>(
    payloadWithPermit: PayloadWithPermit<T>,
  ): Promise<IEncryptedData> {
    // Use ECDH method, to generate local asymmetric keys.
    const ECDHKeys = ECDHEncryption.generate();

    // Get the public key of the smart contract deployed on Secret Network.
    const publicKey = await this.getPublicKey();

    const ECDHSharedKey = ECDHEncryption.generateSharedKey(
      publicKey,
      ECDHKeys.privateKey,
    );

    // Encrypt the JSON with the public ECDH shared key.
    const encryptedPayload = await ECDHEncryption.encrypt(
      payloadWithPermit,
      ECDHSharedKey,
    );

    return {
      payload: Array.from(encryptedPayload),
      public_key: Array.from(ECDHKeys.publicKey),
    };
  }
}

export default SecretDocumentSmartContract;
