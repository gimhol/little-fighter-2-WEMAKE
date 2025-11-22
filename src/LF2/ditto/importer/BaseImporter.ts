import type { BlobUrl, HitUrl, IImporter } from "./IImporter";

export class BaseImporter implements IImporter {
  async import_as_array_buffer(paths: string[]): Promise<[ArrayBuffer, string]> {
    throw new Error("Method not implemented.");
  }
  async import_as_json<T = any>(urls: string[]): Promise<[T, HitUrl]> {
    throw new Error("BaseImporter import_as_json not implemented.");
  }
  async import_as_blob(urls: string[]): Promise<[Blob, HitUrl]> {
    throw new Error("BaseImporter import_as_blob not implemented.");
  }
  async import_as_blob_url(urls: string[]): Promise<[BlobUrl, HitUrl]> {
    throw new Error("BaseImporter import_as_blob_url not implemented.");
  }
}
