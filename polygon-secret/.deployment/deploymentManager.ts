import { loadJSON, saveJSON } from "../utils/files";

export const CONTRACT_NAMES = ["PolygonToSecret"] as const;

export type ContractName = (typeof CONTRACT_NAMES)[number];

const getFilename = (network: string) => `${__dirname}/${network}.json`;

export const getDeploymentAddress = (
  network: string,
  contractName: ContractName
): string => {
  const obj = loadJSON(getFilename(network));
  return obj[contractName] || "Not found";
};

export const getDeployment = (network: string) => {
  const obj = loadJSON(getFilename(network));
  return obj || "Not found";
};

export const setDeploymentAddress = (
  network: string,
  contractName: ContractName,
  value: string
) => {
  const obj = loadJSON(getFilename(network));
  obj[contractName] = value;
  saveJSON(getFilename(network), obj);
};

export const removeDeploymentAddress = (
  network: string,
  contractName: ContractName
) => {
  const obj = loadJSON(getFilename(network));
  delete obj[contractName];
  saveJSON(getFilename(network), obj);
};
