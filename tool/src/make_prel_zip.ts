import { conf } from "./conf";
import { make_zip_and_json } from "./utils/make_zip_and_json";

export async function make_prel_zip() {
  const { IN_PREL_DIR, OUT_DIR, OUT_PREL_NAME } = conf();
  if (!IN_PREL_DIR || !OUT_DIR || !OUT_PREL_NAME) return;
  await make_zip_and_json(IN_PREL_DIR, OUT_DIR, OUT_PREL_NAME, (inf) => {
    inf.type = 'prel';
    return inf;
  });
}
