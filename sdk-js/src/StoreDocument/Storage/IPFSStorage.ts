import { createHeliaHTTP } from '@helia/http';
import { unixfs } from '@helia/unixfs';


import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";

class IPFSStorage implements IStorage {
    async upload(
        encryptedData: ISymmetricEncryptedData,
        options: IUploadOptions,
    ): Promise<any> {
        const helia = await createHeliaHTTP()
        const encoder = new TextEncoder(); // TextEncoder encodes to UTF-8 by default
        const data = encoder.encode(JSON.stringify(encryptedData));
        const fs = unixfs(helia)

        return await fs.addBytes(data);
    }
}

export default IPFSStorage;
