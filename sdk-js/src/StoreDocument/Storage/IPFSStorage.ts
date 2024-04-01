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
    config?: axios.AxiosRequestConfig;
}

class IPFSStorage implements IStorage {
    private readonly gateway: string;
    private readonly config: axios.AxiosRequestConfig;

    constructor({ gateway, config }: Props) {
        this.gateway = gateway;
        this.config = config
    }
    async upload(
        encryptedData: ISymmetricEncryptedData,
        options: IUploadOptions,
    ): Promise<string> {
        const formData = new FormData();
        const dataString = JSON.stringify(encryptedData);

        formData.append('file', dataString);

        const endpoint = `${this.gateway}/api/v0/add`;
        const res = await axios.post(endpoint, formData, this.config);

        if (res.status !== 200) {
            throw Error(`Failed to upload file at ${endpoint}`);
        }

        // Corresponds to the IPFS cid.
        const { Name: cid }: IpfsResponse = res.data;

        return `${this.gateway}/ipfs/${cid}`;
    }
}

export default IPFSStorage;
