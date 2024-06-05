import { Permission, Permit, SecretNetworkClient, TxResponse, MetaMaskWallet, stringToCoins } from "secretjs";
import ISecretNetworkSmartContract from "./ISecretNetworkSmartContract";
import SecretDocumentQueryFactory from "./SecretDocumentQueryFactory";
import {
  GetFileContentResponse,
  GetFileAccessResponse,
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
import { StdSignDoc } from "secretjs/dist/wallet_amino";


interface Props {
  chainId: string;
  client: SecretNetworkClient;
  contract: ISecretNetworkSmartContract;
  wallet: MetaMaskWallet;
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

class SecretDocumentSmartContract {
  private client: SecretNetworkClient;
  private contract: ISecretNetworkSmartContract;
  private wallet: MetaMaskWallet;
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

    const permitName = "SECRET_DOCUMENT_PERMIT_" + Math.ceil(Math.random() * 10000);
    const chainId = this.chainId;
    const permissions: Permission[] = ["owner"];


    const createSignDoc = ():StdSignDoc => (
      {
        chain_id: chainId,
        account_number: "0", // Must be 0
        sequence: "0", // Must be 0
        fee: {
          amount: stringToCoins("0uscrt"), // Must be 0 uscrt
          gas: "1", // Must be 1
        },
        msgs: [
          {
            type: "query_permit", // Must be "query_permit"
            value: {
              permit_name: permitName,
              allowed_tokens: [this.contract.address],
              permissions
            },
          },
        ],
        memo: "", // Must be empty
      }
    );

    const signDoc = createSignDoc();

    // Note: we signed with amino instead of permit as it is "not safe transaction" from metamask
    // and allow us to use `personal_sign` instead.
    // Notice that though that, we will have to handle this signature schema inside the
    // smart contract.
    // Note that it prefix the content by "\x19Ethereum Signed Message:\n" + len(msg) + msg
    // Note also that the msg is json prettyfied !
    const signature = (await this.wallet.signAmino(this.wallet.address, signDoc)).signature;

    return {
      params: {
        chain_id: chainId,
        permit_name: permitName,
        allowed_tokens: [this.contract.address],
        permissions: permissions,
      },
      signature: signature,
    };

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

    async getFileAccess(fileId: string): Promise<{ owner: string; viewers: Array<string> }> {
      const payload = this.queryFactory.getFileAccess(fileId);
      const queryWithPermit = await this.wrapPayloadWithPermit(
          this.queryFactory.query(payload),
      );

      const res = (await this.client.query.compute.queryContract({
        contract_address: this.contract.address,
        code_hash: this.contract.hash,
        query: queryWithPermit,
      })) as GetFileAccessResponse;

      if (!res?.owner) {
        throw new Error(
            `Query failed with the following err: ${JSON.stringify(res)}`,
        );
      }

      return res;
    }
}

export default SecretDocumentSmartContract;
