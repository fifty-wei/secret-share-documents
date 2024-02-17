import IStorage from "./IStorage";
import IEncryptedData from "../Encryption/IEncryptedData";
import IUploadOptions from "./IUploadOptions";
import { createHelia } from "helia";
import { json } from "@helia/json";

interface Props {
  gateway: string; // e.g /ipfs.io/
}

class IPFSStorage implements IStorage {
  gateway: string;
  constructor(private props: Props) {
    this.gateway = props.gateway;
  }
  async upload(data: IEncryptedData, options: IUploadOptions): Promise<string> {
    const helia = await createHelia();
    const j = json(helia);

    const myImmutableAddress = await j.add({ hello: "world" });

    const ipfsAddress = `https://${this.gateway}/ipfs/${myImmutableAddress}`;
    return ipfsAddress;
  }
}

export default IPFSStorage;
