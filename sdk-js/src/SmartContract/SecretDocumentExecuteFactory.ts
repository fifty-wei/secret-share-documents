import {
  ExecutePayload,
  FileRights,
  IExecutePayload,
  IReceiveMessageEvm,
  ManageFileRightsPayload,
  ReceiveMessageEVMPayload,
  StoreNewFilePayload,
} from "./IQueryPayload";

class SecretDocumentExecuteFactory {
  receiveMessageEvm(message: IReceiveMessageEvm): ReceiveMessageEVMPayload {
    return {
      receive_message_evm: message,
    };
  }

  execute(payload: ExecutePayload) {
    return {
      execute: payload,
    };
  }

  storeNewFile(payload: string): StoreNewFilePayload {
    return {
      store_new_file: {
        payload: payload,
      },
    };
  }

  manageFileRights(
    fileId: string,
    fileRights: FileRights,
  ): ManageFileRightsPayload {
    return {
      manage_file_rights: {
        file_id: fileId,
        add_viewing: fileRights?.addViewing || [],
        delete_viewing: fileRights?.deleteViewing || [],
        change_owner: fileRights.changeOwner,
      },
    };
  }
}

export default SecretDocumentExecuteFactory;
