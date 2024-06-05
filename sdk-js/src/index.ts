import Config from "./Config";
import PinataStorage from "./StoreDocument/Storage/PinataStorage";
import IPFSStorage from "./StoreDocument/Storage/IPFSStorage";
import FakeStorage from "./StoreDocument/Storage/FakeStorage";
import SecretDocumentClient from "./SecretDocumentClient";
import Environment from "./Environment";

export {
  Environment,
  SecretDocumentClient,
  Config,
  PinataStorage,
  IPFSStorage,
  FakeStorage,
}
