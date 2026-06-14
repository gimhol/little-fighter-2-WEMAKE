import { Ditto, IGameZipInfo, IZip } from "@/LF2";
import json5 from "json5";

export async function read_file_as_full_game_zip(file: File): Promise<[IGameZipInfo, IZip[]]> {
  const zip = await Ditto.Zip.read_file(file).catch(e => {
    console.warn(`[read_as_full_game_zip]`, e)
    return null;
  });
  if (!zip) {
    const err = new Error(`[ZIP_READ_001] Failed to read file as zip archive: ${file.name}`);
    (err as any).code = 'ZIP_READ_001';
    (err as any).details = { fileName: file.name, fileSize: file.size };
    throw err;
  }
  return read_as_full_game_zip(zip)
}

export async function read_as_full_game_zip(zip: IZip): Promise<[IGameZipInfo, IZip[]]> {
  const index_obj = zip.file('index.json') || zip.file('index.json5')
  if (!index_obj) {
    const err = new Error(`[ZIP_READ_002] index.json or index.json5 not found in zip: ${zip.name}`);
    (err as any).code = 'ZIP_READ_002';
    (err as any).details = { fileName: zip.name };
    throw err;
  }

  const index_json = await index_obj.text().then(str => json5.parse(str))
  if (!index_json) {
    const err = new Error(`[ZIP_READ_003] Failed to parse index file in zip: ${zip.name}`);
    (err as any).code = 'ZIP_READ_003';
    (err as any).details = { fileName: zip.name };
    throw err;
  }

  const info: IGameZipInfo = {
    type: "FULL",
    title: zip.name,
    version: 0,
    description: zip.name,
    author: "",
    paths: [],
  }

  if (Array.isArray(index_json)) { // old
    info.paths = index_json;
  } else if (typeof index_json == 'object') {
    const { type, version, title, description, author, paths } = index_json

    if (type != 'FULL') {
      const err = new Error(`[ZIP_READ_004] Index type mismatch, expected 'FULL' but got '${type}' in: ${zip.name}`);
      (err as any).code = 'ZIP_READ_004';
      (err as any).details = { fileName: zip.name, actualType: type };
      throw err;
    }

    if (typeof version != 'number') {
      const err = new Error(`[ZIP_READ_005] Index version must be number, got ${typeof version} in: ${zip.name}`);
      (err as any).code = 'ZIP_READ_005';
      (err as any).details = { fileName: zip.name, versionType: typeof version };
      throw err;
    }
    info.version = version
    if (typeof title == 'string') info.title = title
    if (typeof description == 'string') info.description = description
    if (typeof author == 'string') info.author = author
    if (Array.isArray(paths)) info.paths = paths
  }

  const { paths } = info;

  if (!Array.isArray(paths)) {
    const err = new Error(`[ZIP_READ_006] Index paths must be an array in: ${zip.name}`);
    (err as any).code = 'ZIP_READ_006';
    (err as any).details = { fileName: zip.name, pathsType: typeof paths };
    throw err;
  }

  if (paths.length < 2) {
    const err = new Error(`[ZIP_READ_007] Index paths must have at least 2 entries, got ${paths.length} in: ${zip.name}`);
    (err as any).code = 'ZIP_READ_007';
    (err as any).details = { fileName: zip.name, pathCount: paths.length };
    throw err;
  }

  if (paths.some(path => typeof path !== 'string')) {
    const err = new Error(`[ZIP_READ_008] All index paths must be strings in: ${zip.name}`);
    (err as any).code = 'ZIP_READ_008';
    (err as any).details = { fileName: zip.name };
    throw err;
  }

  const zips: IZip[] = []
  for (const path of paths) {
    const fileEntry = zip.file(path)
    if (!fileEntry) {
      const err = new Error(`[ZIP_READ_009] Referenced path not found in zip: '${path}' in: ${zip.name}`);
      (err as any).code = 'ZIP_READ_009';
      (err as any).details = { fileName: zip.name, missingPath: path };
      throw err;
    }
    const buf = await fileEntry.uint8_array();
    const z = await Ditto.Zip.read_buf(path, buf)
    zips.push(z);
  }

  if (zips.length < 2) {
    const err = new Error(`[ZIP_READ_010] Expected at least 2 zip files but got ${zips.length} in: ${zip.name}`);
    (err as any).code = 'ZIP_READ_010';
    (err as any).details = { fileName: zip.name, zipCount: zips.length };
    throw err;
  }

  return [info, zips] as const
}
