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
    port?: number;
    config?: axios.AxiosRequestConfig;
}

class IPFSStorage implements IStorage {
    private readonly gateway: string;
    private readonly port: number;
    private readonly config: axios.AxiosRequestConfig;

    constructor({ gateway, port, config }: Props) {
        this.gateway = gateway;
        this.port = port;
        this.config = config
    }
    async upload(
        encryptedData: ISymmetricEncryptedData,
        options: IUploadOptions,
    ): Promise<string> {
        const formData = new FormData();
        const dataString = JSON.stringify(encryptedData);

        formData.append('file', dataString);
        let baseUrl = this.gateway;
        if(!! this.port){
            baseUrl = `${this.gateway}:${this.port.toString()}`
        }

        const endpoint = `${baseUrl}/api/v0/add`;
        const res = await axios.post(endpoint, formData, this.config);

        if (res.status !== 200) {
            throw Error(`Failed to upload file at ${endpoint}`);
        }

        // Corresponds to the IPFS cid.
        const { Name: cid }: IpfsResponse = res.data;

        return `${this.gateway}/ipfs/${cid}`;
    }

    async download(url: string): Promise<ISymmetricEncryptedData> {
        let urlToDownload = url;

        if( url.includes(this.port.toString())){
            urlToDownload = url.replace(`${this.gateway}:${this.port.toString()}`, this.gateway);
        }

        const res = await axios.get(urlToDownload, this.config);

        if (res.status !== 200) {
            throw Error(`Failed to download file at ${url}`);
        }

        return res.data;
    }
}

export default IPFSStorage;
