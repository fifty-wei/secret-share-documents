export type IToken = {
  name: string;
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  minimumTransactionAmount?: string;
};

export enum NetworkEnum {
  LOCAL = 1337,
  MUMBAI = 80001,
}
