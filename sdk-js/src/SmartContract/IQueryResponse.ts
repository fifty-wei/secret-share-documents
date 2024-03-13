export interface PublicKeyResponse {
  public_key: Array<number>;
}

export interface GetFileContentResponse {
  payload: string;
}

export interface GetFileIdsResponse {
  file_ids: Array<string>;
}
