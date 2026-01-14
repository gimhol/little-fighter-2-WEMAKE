import { read_argv } from "./read_argv";
import { make_zip_and_json } from "./utils/make_zip_and_json";

export async function make_prel_zip() {
  const { PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME } = await read_argv();
  await make_zip_and_json(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME, (inf) => {
    inf.type = 'prel';
    return inf;
  });
}
