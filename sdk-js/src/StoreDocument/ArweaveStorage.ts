import IStorage from "./IStorage";
import Arweave from 'arweave';

class ArweaveStorage implements IStorage {

  arweave: Arweave;
  key: any;

  constructor({ key, host, port, protocol }) {
    // this.key = JSON.parse(fs.readFileSync("walletFile.txt").toString());
    this.key = key;
    this.arweave = Arweave.init({
      host: host,
      port: port,
      protocol: protocol
    });
  }

  async uploadFile(url: string): Promise<string> {
    const response = await fetch(url);

    // Check if response is OK (status 200)
    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.statusText}`);
    }

    // Assuming binary content, read it as buffer
    const data = await response.arrayBuffer();

    // Create a data transaction.
    const transaction = await this.arweave.createTransaction({
      data: data
    }, this.key);

    if (response.headers.get('content-type')) {
      // Precise the gateway how to serve this data to a browser.
      transaction.addTag('Content-Type', response.headers.get('content-type'));
    }

    // Sign the transaction with your key before posting.
    await this.arweave.transactions.sign(transaction, this.key);

    // Create an uploader that will seed your data to the network.
    let uploader = await this.arweave.transactions.getUploader(transaction);

    // Run the uploader until it completes the upload.
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
    }

    // @see Documentation about transactions link: https://cookbook.arweave.dev/guides/http-api.html
    // Get raw transaction data : https://arweave.net/raw/TX_ID
    // Get cached TX data
    return `https://arweave.net/${transaction.id}`;

  }

}

export default ArweaveStorage;
