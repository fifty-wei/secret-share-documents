// import { createHelia } from "helia";
// import { trustlessGateway } from "@helia/block-brokers";
// import { delegatedHTTPRouting } from "@helia/routers";
// import { json } from "@helia/json";
import { create } from "ipfs-http-client";

import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";

class IPFSStorage implements IStorage {
  async upload(
    encryptedData: ISymmetricEncryptedData,
    options: IUploadOptions,
  ): Promise<any> {
    const client = create();

    const { cid } = await client.add(JSON.stringify(encryptedData));

    return cid;

    // const helia = await createHeliaHTTP({
    //   blockBrokers: [
    //     trustlessGateway({
    //       gateways: ["https://ipfs.io"],
    //     }),
    //   ],
    //   routers: [delegatedHTTPRouting("https://delegated-ipfs.dev")],
    // });
    // // const helia = await createHelia();
    // const j = json(helia);

    // return await j.add(encryptedData);
  }
}

export default IPFSStorage;
