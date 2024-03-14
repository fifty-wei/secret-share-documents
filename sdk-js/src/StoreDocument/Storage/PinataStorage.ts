const axios = require('axios')
const FormData = require('form-data')

import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";

class PinataStorage implements IStorage {

  // Access token for the request
  access_token: string;

  constructor(access_token: string) {
    this.access_token = access_token;
  }

  async upload(
    encryptedData: ISymmetricEncryptedData,
    options: IUploadOptions,
  ): Promise<any> {
    
    const formData = new FormData();

    // Store the file
    formData.append('file', JSON.stringify(encryptedData), "secret_data.json");

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${this.access_token}`,
          ...formData.getHeaders()
        }
      });

    return res["data"]["IpfsHash"];
  }
}

export default PinataStorage;
