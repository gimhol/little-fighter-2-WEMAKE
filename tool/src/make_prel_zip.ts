import { conf } from "./conf";
import { debug, info } from "./utils/log";
import { make_zip_and_json } from "./utils/make_zip_and_json";

export async function make_prel_zip() {
  debug(`make_prel_zip()`)
  const { IN_PREL_DIR, OUT_DIR, OUT_PREL_NAME, CONF_FILE } = conf();
  if (!OUT_PREL_NAME)
    return info(`'prel zip' will not be created, because 'OUT_PREL_NAME' is not set in '${CONF_FILE}'.`)
  if (!IN_PREL_DIR)
    return info(`'${OUT_PREL_NAME}' will not be created, because 'IN_PREL_DIR' is not set in '${CONF_FILE}'.`)
  if (!OUT_DIR)
    return info(`'${OUT_PREL_NAME}' will not be created, because 'OUT_DIR' is not set in '${CONF_FILE}'.`)
  await make_zip_and_json(IN_PREL_DIR, OUT_DIR, OUT_PREL_NAME, (inf) => {
    inf.type = 'prel';
    return inf;
  });
}
