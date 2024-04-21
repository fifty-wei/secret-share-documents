import { create } from 'kubo-rpc-client';
import ISymmetricEncryptedData from "../../Encryption/ISymmetricEncryptedData";
import IStorage from "./IStorage";
import IUploadOptions from "./IUploadOptions";

interface Props {
    ipfsNode?: string;
    ipfsGateway: string;
}

class KuboStorage implements IStorage {
    private readonly ipfsNode: string;
    private readonly ipfsGateway: any;

    constructor({ ipfsNode, ipfsGateway }: Props) {
        this.ipfsNode = ipfsNode;
        this.ipfsGateway = ipfsGateway;
    }
    async upload(
        encryptedData: ISymmetricEncryptedData,
        options: IUploadOptions,
    ): Promise<any> {
        const ipfs = create({ url: this.ipfsNode });
        const encoder = new TextEncoder(); // Used to convert the string to an array buffer
        const encryptedDataBuffer = encoder.encode(JSON.stringify(encryptedData));
        const { cid } = await ipfs.add(encryptedDataBuffer);
        const publicUrl = `${this.ipfsGateway}/ipfs/${cid}`;

        const res = await fetch(publicUrl)
        if (!res.ok) {
            throw Error(`Failed to load uploaded file at ${publicUrl}`);
        }

        return cid;
    }
}

export default KuboStorage;
