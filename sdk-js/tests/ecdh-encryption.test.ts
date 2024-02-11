import { test, expect } from "@jest/globals";
import ECDHEncryption from "../src/StoreDocument/Encryption/ECDHEncryption";

test("Generate ECDH Key Pairs", async () => {
  const ECDHKeys = ECDHEncryption.generate();

  console.log("[INFO] ECDH Keys:", { ECDHKeys });
  expect(ECDHKeys).toBeDefined();
  expect(ECDHKeys).toHaveProperty("privateKey");
  expect(ECDHKeys).toHaveProperty("publicKey");
});

test("Generate ECDH shared keys", async () => {
  const ECDHKeysA = ECDHEncryption.generate();
  const ECDHKeysB = ECDHEncryption.generate();

  const sharedKeyA = ECDHEncryption.generateSharedKey(
    ECDHKeysB.publicKey,
    ECDHKeysA.privateKey,
  );
  const sharedKeyB = ECDHEncryption.generateSharedKey(
    ECDHKeysA.publicKey,
    ECDHKeysB.privateKey,
  );

  console.log("[INFO] ECDH shared Keys:", { sharedKeyA }, { sharedKeyB });
  expect(sharedKeyA).toBeDefined();
  expect(sharedKeyB).toBeDefined();
  expect(sharedKeyA).toEqual(sharedKeyA);
});

test("Encrypt Data with ECDH shared key", async () => {
  const ECDHKeysA = ECDHEncryption.generate();
  const ECDHKeysB = ECDHEncryption.generate();

  const sharedKey = ECDHEncryption.generateSharedKey(
    ECDHKeysB.publicKey,
    ECDHKeysA.privateKey,
  );

  const data = { fake: "test" };
  const encryptedData = await ECDHEncryption.encrypt(data, sharedKey);

  console.log("[INFO] ECDH encryptedData:", { encryptedData });
  expect(encryptedData).toBeDefined();
});
