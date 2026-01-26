import { zip } from "compressing";
import { createWriteStream } from "fs";
import { join } from "path/posix";
import { pipeline } from "stream/promises";
import { conf } from "./conf";
import { write_file } from "./utils/write_file";

export async function make_full_zip() {
  const {
    OUT_DIR, OUT_PREL_NAME, OUT_DATA_NAME, OUT_FULL_NAME
  } = conf();

  const prel_zip_path = join(OUT_DIR, OUT_PREL_NAME);
  const data_zip_path = join(OUT_DIR, OUT_DATA_NAME);
  const index_path = join(OUT_DIR, 'index.json');
  const index_str = JSON.stringify([
    OUT_PREL_NAME,
    OUT_DATA_NAME
  ]);
  await write_file(index_path, index_str);
  const zip_stream = new zip.Stream();
  zip_stream.addEntry(prel_zip_path);
  zip_stream.addEntry(data_zip_path);
  zip_stream.addEntry(index_path);

  const full_zip_path = join(OUT_DIR, OUT_FULL_NAME);
  const dest_stream = createWriteStream(full_zip_path);
  await pipeline(zip_stream, dest_stream);
}
