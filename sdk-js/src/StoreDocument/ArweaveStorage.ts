import IStorage from "./IStorage";
import IEncryptedData from "./IEncryptedData";
import IUploadOptions from "./IUploadOptions";
import Arweave from 'arweave';
import { JWKInterface } from "arweave/node/lib/wallet";

interface Props {
  key: JWKInterface;
  host?: string;
  port?: number;
  protocol?: string;
}

class ArweaveStorage implements IStorage {

  arweave: Arweave;
  key: any;

  constructor({ key, host, port, protocol }: Props) {
    // this.key = JSON.parse(fs.readFileSync("walletFile.txt").toString());
    this.arweave = Arweave.init({
      host: host,
      port: port,
      protocol: protocol
    });
    this.key = key ? key : this.arweave.wallets.generate();
  }

  serializeToBinary(encryptedData: IEncryptedData): ArrayBuffer {
    const encoder = new TextEncoder();
    const initialVectorBuffer = encoder.encode(encryptedData.initialVector);
    const dataBuffer = encryptedData.data;
    const authTagBuffer = encoder.encode(encryptedData.authTag);
    // Concatenate buffers
    const concatenatedBuffer = Buffer.concat([initialVectorBuffer, dataBuffer, authTagBuffer]);
    // Convert the concatenated buffer to ArrayBuffer
    return concatenatedBuffer.buffer.slice(concatenatedBuffer.byteOffset, concatenatedBuffer.byteOffset + concatenatedBuffer.byteLength);
  }

  async upload(encryptedData: IEncryptedData, options: IUploadOptions): Promise<any> {
    // Create a data transaction.
    const transaction = await this.arweave.createTransaction({
      // data: this.serializeToBinary(encryptedData)
      data: 'toto'
    });

    if (!!options.contentType) {
      // Precise the gateway how to serve this data to a browser.
      transaction.addTag('Content-Type', options.contentType);
    }

    // Sign the transaction with your key before posting.
    await this.arweave.transactions.sign(transaction, this.key);

    const { status, statusText, data } = await this.arweave.transactions.post(transaction);

    if (status !== 200) {
      throw new Error(statusText);
    }

    return data;

    // // Create an uploader that will seed your data to the network.
    // let uploader = await this.arweave.transactions.getUploader(transaction);

    // // Run the uploader until it completes the upload.
    // while (!uploader.isComplete) {
    //   await uploader.uploadChunk();
    //   console.log(`${uploader.pctComplete}%`)
    // }

    // // @see Documentation about transactions link: https://cookbook.arweave.dev/guides/http-api.html
    // // Get raw transaction data : https://arweave.net/raw/TX_ID
    // // Get cached TX data
    // return `https://arweave.net/${transaction.id}`;

  }

}

export default ArweaveStorage;
