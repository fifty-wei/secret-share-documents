import Config from "./Config";
import PinataStorage from "./StoreDocument/Storage/PinataStorage";
import IPFSStorage from "./StoreDocument/Storage/IPFSStorage";
import FakeStorage from "./StoreDocument/Storage/FakeStorage";
import SecretDocumentClient from "./SecretDocumentClient";
import Environment from "./Environment";
import Network from "./Network";
import { MetaMaskWallet, Wallet } from "secretjs";
import { EvmChain } from "@axelar-network/axelarjs-sdk";

export {
    Network,
    Environment,
    SecretDocumentClient,
    Config,
    PinataStorage,
    IPFSStorage,
    FakeStorage,
    Wallet,
    MetaMaskWallet,
    EvmChain
}
