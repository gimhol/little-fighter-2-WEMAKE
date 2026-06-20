export class ImportError extends Error {
  static is = (v: any): v is ImportError => v.is_make_import_error === true;
  readonly is_make_import_error = true;
  readonly url_err_pair_list: [string, any][];
  constructor(path_or_url_list: string[], url_err_pair_list: any[]) {
    super(`failed, path or url: ${path_or_url_list.join(", ")}`);
    this.name = "MakeImportError";
    this.url_err_pair_list = url_err_pair_list;
  }
}
