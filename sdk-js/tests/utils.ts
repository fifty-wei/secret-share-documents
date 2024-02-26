import SecretDocumentClient from "../src";
import SecretDocumentSmartContract from "../src/SmartContract/SecretDocumentSmartContract";
import StoreDocument from "../src/StoreDocument";

export async function store({
  secretDocument,
  storeDocument,
  fileUrl,
}: {
  secretDocument: SecretDocumentSmartContract;
  storeDocument: StoreDocument;
  fileUrl: string;
}) {
  let uploadOptions = {
    contentType: "toBeDefined",
  };
  const { data, contentType } = await storeDocument.fetchDocument(fileUrl);
  uploadOptions.contentType = contentType;
  const bufferData = Buffer.from(data);

  const encryptedMessage = await storeDocument.getEncryptedMessage(
    bufferData,
    uploadOptions,
  );

  const payload = {
    source_chain: "test-chain",
    source_address: "test-address",
    payload: encryptedMessage,
  };

  return await secretDocument.store(payload);
}
