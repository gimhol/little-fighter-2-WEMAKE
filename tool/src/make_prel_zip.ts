import { conf } from "./conf";
import { make_zip_and_json } from "./utils/make_zip_and_json";

export async function make_prel_zip() {
  const { IN_PREL_DIR, OUT_DIR, OUT_PREL_NAME } = conf();
  if (!IN_PREL_DIR)
    return console.log("'prel zip' will not be created, because 'IN_PREL_DIR' is not set in 'conf file'.")
  if (!OUT_DIR)
    return console.log("'prel zip' will not be created, because 'OUT_DIR' is not set in 'conf file'.")
  if (!OUT_PREL_NAME)
    return console.log("'prel zip' will not be created, because 'OUT_PREL_NAME' is not set in 'conf file'.")
  await make_zip_and_json(IN_PREL_DIR, OUT_DIR, OUT_PREL_NAME, (inf) => {
    inf.type = 'prel';
    return inf;
  });
}
