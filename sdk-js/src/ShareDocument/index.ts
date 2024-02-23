import SecretDocumentSmartContract from "../SmartContract/SecretDocumentSmartContract";
import ECDHEncryption from "../Encryption/ECDHEncryption";

interface Props {
  secretDocument: SecretDocumentSmartContract;
}

interface FileRights {
  addViewing?: Array<string>;
  deleteViewing?: Array<string>;
  changeOwner?: string;
}

class ShareDocument {
  secretDocument: SecretDocumentSmartContract;

  constructor({ secretDocument }: Props) {
    this.secretDocument = secretDocument;
  }

  getManagedFileRights(fileId: string, fileRights: FileRights) {
    return {
      file_id: fileId,
      add_viewing: fileRights?.addViewing || [],
      delete_viewing: fileRights?.deleteViewing || [],
      change_owner:
        fileRights?.changeOwner || this.secretDocument.getWallet().address,
    };
  }

  async getEncryptedMessage(fileId: string, fileRights: FileRights) {
    // Use ECDH method, to generate local asymmetric keys.
    const ECDHKeys = ECDHEncryption.generate();
    // Get the public key of the smart contract deployed on Secret Network
    const shareDocumentPublicKey = await this.secretDocument.getPublicKey();

    const ECDHSharedKey = ECDHEncryption.generateSharedKey(
      shareDocumentPublicKey,
      ECDHKeys.privateKey,
    );

    const shareDocumentPermit = await this.secretDocument.generatePermit();

    // Build new JSON with permit + the ECDH public key.
    const payloadWithPermit = {
      with_permit: {
        permit: shareDocumentPermit,
        execute: {
          manage_file_rights: this.getManagedFileRights(fileId, fileRights),
        },
      },
    };

    // Encrypt the JSON with the public ECDH shared key.
    const encryptedPayload = await ECDHEncryption.encrypt(
      payloadWithPermit,
      ECDHSharedKey,
    );

    return {
      payload: Array.from(encryptedPayload),
      public_key: Array.from(ECDHKeys.publicKey),
    };
  }

  async share(encryptedMessage: any): Promise<any> {
    return this.secretDocument.share(encryptedMessage);
  }
}

export default ShareDocument;
