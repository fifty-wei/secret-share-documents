import IStorage from "./IStorage";
import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IUploadOptions from "./IUploadOptions";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";

interface Props {
  client: Arweave;
  key: JWKInterface;
}

class ArweaveStorage implements IStorage {
  client: Arweave;
  key: any;

  constructor({ client, key }: Props) {
    this.key = key;
    this.client = client;
  }

  async getBalance() {
    const address = await this.client.wallets.jwkToAddress(this.key);
    return await this.client.wallets.getBalance(address);
  }

  unserializeFromBinary(data: ArrayBuffer): ISymmetricEncryptedData {
    const decoder = new TextDecoder();

    // Get the length of the initial vector from the start of the ArrayBuffer.
    const ivLength = data[0];
    // Get the length of the auth tag from the end of the ArrayBuffer.
    const authTagLength = data[data.byteLength - 1];

    // Calculate the start and end of each part of the ArrayBuffer.
    const initialVectorStart = 1;
    const initialVectorEnd = initialVectorStart + ivLength;
    const dataStart = initialVectorEnd;
    const dataEnd = data.byteLength - 1 - authTagLength;

    // Extract the initial vector, encrypted data and auth tag.
    const initialVector = decoder.decode(
      data.slice(initialVectorStart, initialVectorEnd),
    );
    const encryptedData = Buffer.from(data.slice(dataStart, dataEnd));
    const authTag = decoder.decode(data.slice(dataEnd));

    return {
      initialVector: initialVector,
      data: encryptedData,
      authTag: authTag,
    };
  }

  serializeToBinary(encryptedData: ISymmetricEncryptedData): ArrayBuffer {
    const encoder = new TextEncoder();
    const initialVectorBuffer = encoder.encode(encryptedData.initialVector);
    const dataBuffer = encryptedData.data;
    const authTagBuffer = encoder.encode(encryptedData.authTag);
    // Concatenate buffers
    const concatenatedBuffer = Buffer.concat([
      initialVectorBuffer,
      dataBuffer,
      authTagBuffer,
    ]);
    // Convert the concatenated buffer to ArrayBuffer
    return concatenatedBuffer.buffer.slice(
      concatenatedBuffer.byteOffset,
      concatenatedBuffer.byteOffset + concatenatedBuffer.byteLength,
    );
  }

  async upload(
    encryptedData: ISymmetricEncryptedData,
    options: IUploadOptions,
  ): Promise<any> {
    // Create a data transaction.
    const transaction = await this.client.createTransaction({
      data: this.serializeToBinary(encryptedData),
      // data: 'toto'
    });

    if (!!options.contentType) {
      // Precise the gateway how to serve this data to a browser.
      transaction.addTag("Content-Type", options.contentType);
    }

    // Sign the transaction with your key before posting.
    await this.client.transactions.sign(transaction, this.key);

    // const { status, statusText, data } = await this.arweave.transactions.post(transaction);

    // if (status !== 200) {
    //   throw new Error(statusText);
    // }

    // return data;

    // Create an uploader that will seed your data to the network.
    let uploader = await this.client.transactions.getUploader(transaction);

    // Run the uploader until it completes the upload.
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}%`);
    }

    console.log({ uploader });

    // @see Documentation about transactions link: https://cookbook.arweave.dev/guides/http-api.html
    // Get raw transaction data : https://arweave.net/raw/TX_ID

    // Get cached TX data
    return `https://arweave.net/${transaction.id}`;
  }
}

export default ArweaveStorage;
