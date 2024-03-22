import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import {
  FileRights,
  IReceiveMessageEvm,
  ManageFileRightsPayload,
} from "../SmartContract/IQueryPayload";
import PolygonToSecretSmartContrat from "../SmartContract/PolygonToSecretSmartContract";

interface Props {
  secretDocument: SecretDocumentSmartContract;
  polygonToSecret: PolygonToSecretSmartContrat;
}

class ShareDocument {
  private secretDocument: SecretDocumentSmartContract;
  private polygonToSecret: PolygonToSecretSmartContrat;
  private fileId?: string;

  constructor({ secretDocument, polygonToSecret }: Props) {
    this.secretDocument = secretDocument;
    this.polygonToSecret = polygonToSecret;
    this.fileId = null;
  }

  async getEncryptedMessage(fileId: string, fileRights: Partial<FileRights>) {
    const fileRightsWithOwner = {
      ...fileRights,
      changeOwner: fileRights?.changeOwner
        ? fileRights.changeOwner
        : this.secretDocument.getWallet().address,
    };

    const manageFileRightsPayload = this.secretDocument
      .getExecuteFactory()
      .manageFileRights(fileId, fileRightsWithOwner);

    const payloadWithPermit =
      await this.secretDocument.wrapPayloadWithPermit<ManageFileRightsPayload>(
        this.secretDocument
          .getExecuteFactory()
          .execute(manageFileRightsPayload),
      );

    return this.secretDocument.encryptPayload(payloadWithPermit);
  }

  setFileId(fileId: string){
    this.fileId = fileId;

    return this;
  }

  public async share(fileRights: Partial<FileRights>): Promise<`0x${string}`> {
    if( ! this.fileId ){
      throw new Error("Please set the fileId before sharing a document");
    }
    const encryptedMessage = await this.getEncryptedMessage(this.fileId, fileRights);
    const receiveMessageEvm: IReceiveMessageEvm = {
      source_chain: "test-chain",
      source_address: "test-address",
      payload: encryptedMessage,
    };
    return this.polygonToSecret.send(receiveMessageEvm);
  }

  public async changeOwner(address: string) {
    return this.share({changeOwner: address});
  }

  public async addViewing(addresses: string[]) {
    return this.share({addViewing: addresses});
  }

  public async deleteViewing(addresses: string[]) {
    return this.share({deleteViewing: addresses});
  }
}

export default ShareDocument;
