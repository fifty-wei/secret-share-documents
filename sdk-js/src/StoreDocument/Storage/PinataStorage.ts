
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
    formData.append('file', encryptedData)

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${this.access_token}`
      },
      // maxBodyLength: "Infinity",
      body: formData
    };

    const res = fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });

    return res;
  }
}

export default PinataStorage;
