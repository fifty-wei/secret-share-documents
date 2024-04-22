import { createContext } from "react";
import SecretDocumentClient from "../../../sdk-js/src";

interface SecretDocumentContextType {
  client: SecretDocumentClient | undefined;
  secretNetworkAddress: string;
}

export const SecretDocumentContext = createContext<SecretDocumentContextType>({
  client: undefined,
  secretNetworkAddress: "",
});
