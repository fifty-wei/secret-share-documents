
const axios = require('axios')
const FormData = require('form-data')

import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";

class PinataStorage implements IStorage {
  async upload(
    encryptedData: ISymmetricEncryptedData,
    options: IUploadOptions,
  ): Promise<any> {
    
    const JWT = options.pinata_token;
    
    const formData = new FormData();
    formData.append('file', encryptedData)
            
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try{
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'Authorization': `Bearer ${JWT}`
            }
        });
        console.log(res.data);
    } catch (error) {
       console.log(error);
    }
    
  }
}

export default IPFSStorage;
