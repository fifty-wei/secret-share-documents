import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";
import axios from 'axios';

type IpfsResponse = {
    Name: string;
    Hash: string;
    Size: string;
}

interface Props {
    gateway: string;
}

class IPFSStorage implements IStorage {
    private readonly gateway: string;

    constructor({ gateway }: Props) {
        this.gateway = gateway;
    }
    async upload(
        encryptedData: ISymmetricEncryptedData,
        options: IUploadOptions,
    ): Promise<any> {
        const formData = new FormData();
        const dataString = JSON.stringify(encryptedData);

        formData.append('file', dataString);

        const endpoint = `${this.gateway}/api/v0/add`;
        const res = await axios.post(endpoint, formData);

        if (res.status !== 200) {
            throw Error(`Failed to upload file at ${endpoint}`);
        }

        // Corresponds to the IPFS cid.
        const { Name: cid }: IpfsResponse = res.data;

        console.log({cid});

        return cid;
    }
}

export default IPFSStorage;
