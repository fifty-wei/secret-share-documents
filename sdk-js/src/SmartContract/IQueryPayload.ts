import IEncryptedData from "../Encryption/IEncryptedData";

export interface GetContractKeyPayload {
  get_contract_key: {};
}

export interface GetFileIdsPayload {
  get_file_ids: {};
}

export interface GetFileContentPayload {
  get_file_content: {
    file_id: string;
  };
}

export interface StoreNewFilePayload {
  store_new_file: {
    payload: string;
  };
}

export interface IReceiveMessageEvm {
  source_chain: string;
  source_address: string;
  payload: IEncryptedData;
}

export interface ReceiveMessageEVMPayload {
  receive_message_evm: IReceiveMessageEvm;
}

export interface FileRights {
  addViewing?: Array<string>;
  deleteViewing?: Array<string>;
  changeOwner: string; // Need to be declare even the owner is not changed.
}

export interface ManageFileRightsPayload {
  manage_file_rights: {
    file_id: string;
    add_viewing: Array<string>;
    delete_viewing: Array<string>;
    change_owner: string;
  };
}

export type ExecutePayload = StoreNewFilePayload | ManageFileRightsPayload;

export interface IExecutePayload<T extends ExecutePayload> {
  execute: T;
}

export type QueryPayload =
  | GetContractKeyPayload
  | GetFileIdsPayload
  | GetFileContentPayload;

export interface IQueryPayload<T extends QueryPayload> {
  query: T;
}

export type IContractPayload = Partial<ExecutePayload & QueryPayload>;
