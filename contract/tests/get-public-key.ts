import assert from "assert";
import ShareDocumentSmartContract from "../../sdk-js/SmartContract/ShareDocumentSmartContract";

export async function runGetPublicKey() {
  console.log("initializing get public key test");
  const publicKey = await ShareDocumentSmartContract.getPublicKey();

  assert(publicKey.length > 0, "public key is empty");
}
