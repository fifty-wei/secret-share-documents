export async function store({ secretDocument, storeDocument, fileUrl }) {
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
