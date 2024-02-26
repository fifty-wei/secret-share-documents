import {
  GetContractKeyPayload,
  GetFileContentPayload,
  GetFileIdsPayload,
  QueryPayload,
} from "./IQueryPayload";

class SecretDocumentQueryFactory {
  getContractKey(): GetContractKeyPayload {
    return { get_contract_key: {} };
  }

  getFileIds(): GetFileIdsPayload {
    return {
      get_file_ids: {},
    };
  }

  getFileContent(fileId: string): GetFileContentPayload {
    return {
      get_file_content: {
        file_id: fileId,
      },
    };
  }

  query(payload: QueryPayload) {
    return {
      query: payload,
    };
  }
}

export default SecretDocumentQueryFactory;
