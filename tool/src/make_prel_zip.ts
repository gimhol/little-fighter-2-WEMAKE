
import { join } from "path";
import { Defines } from "../../src/LFW/defines/defines";
import { IPrelZipInfo } from "../../src/LFW/defines/IFullGameZipInfo";
import { conf } from "./conf";
import { debug, info as log } from "./utils/log";
import { make_zip_and_json } from "./utils/make_zip_and_json";
import * as fs from "fs/promises"
import JSON5 from "json5"
import { write_file } from "./utils/write_file";

export async function make_prel_zip() {
  debug(`make_prel_zip()`)
  const { IN_PREL_DIR, OUT_DIR, TMP_PREL_DIR, OUT_PREL_NAME, CONF_FILE } = conf();
  if (!OUT_PREL_NAME)
    return log(`'prel zip' will not be created, because 'OUT_PREL_NAME' is not set in '${CONF_FILE}'.`)
  if (!IN_PREL_DIR)
    return log(`'${OUT_PREL_NAME}' will not be created, because 'IN_PREL_DIR' is not set in '${CONF_FILE}'.`)
  if (!OUT_DIR)
    return log(`'${OUT_PREL_NAME}' will not be created, because 'OUT_DIR' is not set in '${CONF_FILE}'.`)
  if (!TMP_PREL_DIR)
    return log(`'${TMP_PREL_DIR}' will not be created, because 'TMP_PREL_DIR' is not set in '${CONF_FILE}'.`)

  await fs.rm(TMP_PREL_DIR, { recursive: true }).catch(e => { })
  await fs.cp(IN_PREL_DIR, TMP_PREL_DIR, { recursive: true, force: true, errorOnExist: false }).catch(e => { })
  const info: IPrelZipInfo = {
    type: "PREL",
    title: "Little Fighter Wemake Prel Zip",
    version: Defines.DATA_VERSION,
    description: "Little Fighter Wemake Prel Zip",
    author: "Gim"
  }
  try {
    const buf =
      await fs.readFile(join(IN_PREL_DIR, "index.json5")).catch(() => null) ||
      await fs.readFile(join(IN_PREL_DIR, "index.json")).catch(() => null);
    if (buf) {
      const raw: object = JSON5.parse(buf.toString())
      if ('title' in raw && typeof raw.title == 'string') info.title = raw.title;
      if ('desc' in raw && typeof raw.desc == 'string') info.description = raw.desc;
      if ('description' in raw && typeof raw.description == 'string') info.description = raw.description;
      if ('author' in raw && typeof raw.author == 'string') info.author = raw.author;
    }
  } catch (e) {
    console.error(e)
  }
  await write_file(join(TMP_PREL_DIR, "index.json5"), JSON.stringify(info))
  await make_zip_and_json(TMP_PREL_DIR, OUT_DIR, OUT_PREL_NAME, (inf) => {
    inf.type = 'prel';
    return inf;
  });
}
