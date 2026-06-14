import { zip } from "compressing";
import { createWriteStream, existsSync } from "fs";
import { mkdir } from "fs/promises"
import { join } from "path/posix";
import { pipeline } from "stream/promises";
import { Defines } from "../../src/LF2/defines";
import { IGameZipInfo } from "../../src/LF2/defines/IFullGameZipInfo";
import { conf } from "./conf";
import { debug, info } from "./utils/log";
import { write_file } from "./utils/write_file";
export async function make_full_zip() {
  debug(`make_full_zip()`)
  const {
    OUT_DIR, OUT_PREL_NAME, OUT_DATA_NAME, OUT_FULL_NAME, CONF_FILE, TMP_FULL_DIR,
  } = conf();
  if (!OUT_DIR)
    return info(`'full zip' will not be created, because 'OUT_DIR' is not set in '${CONF_FILE}'.`)
  if (!OUT_PREL_NAME)
    return info(`'full zip' will not be created, because 'OUT_PREL_NAME' is not set in '{CONF_FILE}'.`)
  if (!OUT_DATA_NAME)
    return info(`'full zip' will not be created, because 'OUT_DATA_NAME' is not set in '{CONF_FILE}'.`)
  if (!OUT_FULL_NAME)
    return info(`'full zip' will not be created, because 'OUT_FULL_NAME' is not set in '{CONF_FILE}'.`)
  if (!TMP_FULL_DIR)
    return info(`'full zip' will not be created, because 'TMP_FULL_DIR' is not set in '{CONF_FILE}'.`)
  const prel_zip_path = join(OUT_DIR, OUT_PREL_NAME);
  const data_zip_path = join(OUT_DIR, OUT_DATA_NAME);
  if (
    !existsSync(prel_zip_path) ||
    !existsSync(data_zip_path)
  ) {
    info(`'full zip' will not be created. 'prel zip' or 'data zip' does not exist.`)
    return
  }

  const index_info: IGameZipInfo = {
    // TODO: allow rewrite it.
    type: "FULL",
    version: Defines.DATA_VERSION,
    title: "Little Fighter Wemake Origin (DEMO)",
    description: "Little Fighter Wemake Origin Full Game Data",
    author: "Gim",
    paths: [OUT_PREL_NAME, OUT_DATA_NAME]
  }
  const index_path = join(TMP_FULL_DIR, 'index.json5');
  const index_str = JSON.stringify(index_info);
  await mkdir(TMP_FULL_DIR, { recursive: true }).catch(e => null);
  await write_file(index_path, index_str);

  const zip_stream = new zip.Stream();
  zip_stream.addEntry(prel_zip_path);
  zip_stream.addEntry(data_zip_path);
  zip_stream.addEntry(index_path);

  const full_zip_path = join(OUT_DIR, OUT_FULL_NAME);
  const dest_stream = createWriteStream(full_zip_path);
  await pipeline(zip_stream, dest_stream);
}
