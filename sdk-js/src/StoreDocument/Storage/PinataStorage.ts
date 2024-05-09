const axios = require('axios')
const FormData = require('form-data')

import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";


class PinataStorage implements IStorage {

    // Access token for the request
    access_token: string;
    gateway: string;

    constructor(gateway: string, access_token: string) {
        this.gateway = gateway;
        this.access_token = access_token;
    }

    async upload(
        encryptedData: ISymmetricEncryptedData,
        options: IUploadOptions,
    ): Promise<any> {

        const formData = new FormData();
        
        let file_data = new Blob([
            JSON.stringify(encryptedData)
        ], {
            type: 'application/json'
        })

        // Store the file
        formData.append('file', file_data, "secret_data.json");

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        })

        formData.append('pinataOptions', pinataOptions);

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${this.access_token}`,
            }
        });

        return res["data"]["IpfsHash"];
    }

    async download(cid: string): Promise<ISymmetricEncryptedData> {

        let source_url = this.gateway + "/ipfs/" + cid;
        const res = await axios.get(source_url);

        if (res.status !== 200) {
            throw Error(`Failed to download file at ${source_url}`);
        }
        
        return res.data;
    }
}

export default PinataStorage;