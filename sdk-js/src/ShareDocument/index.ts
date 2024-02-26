import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import ECDHEncryption from "../Encryption/ECDHEncryption";
import {
  FileRights,
  IExecutePayload,
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

  constructor({ secretDocument, polygonToSecret }: Props) {
    this.secretDocument = secretDocument;
    this.polygonToSecret = polygonToSecret;
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

  async share(fileId: string, fileRights: Partial<FileRights>): Promise<any> {
    const encryptedMessage = await this.getEncryptedMessage(fileId, fileRights);
    const receiveMessageEvm: IReceiveMessageEvm = {
      source_chain: "test-chain",
      source_address: "test-address",
      payload: encryptedMessage,
    };
    return this.polygonToSecret.send(receiveMessageEvm);
  }
}

export default ShareDocument;
