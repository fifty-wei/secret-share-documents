import IStorage from "./IStorage";
import IEncryptedData from "../Encryption/IEncryptedData";
import IUploadOptions from "./IUploadOptions";
import { create, IPFSHTTPClient } from "ipfs-http-client";

interface Props {
  infuraId: string;
  infuraSecret: string;
  gateway: string; // e.g /ipfs.io/
}

class IPFSStorage implements IStorage {
  private client: IPFSHTTPClient;

  gateway: string;
  authorization: string;
  ipfsWriteUrl: string;

  constructor({ infuraId, infuraSecret, gateway }: Props) {
    this.gateway = gateway;

    this.client = create({
      url: this.ipfsWriteUrl,
      headers: {
        authorization:
          "Basic " +
          Buffer.from(`${infuraId}:${infuraSecret}`).toString("base64"),
      },
    });
  }

  async upload(data: IEncryptedData, options: IUploadOptions): Promise<string> {
    const cid = await this.client.add(data.data);
    return `${this.gateway}/ipfs/${cid}`;
  }
}

export default IPFSStorage;
