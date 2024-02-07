export default interface IStorage {
  uploadFile(url: string): Promise<string>;
}
