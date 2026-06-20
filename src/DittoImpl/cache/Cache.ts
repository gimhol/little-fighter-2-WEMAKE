import Dexie, { type EntityTable } from "dexie";
import type { ICache } from "@/LFW/ditto/cache";
import type { ICacheData } from "@/LFW/ditto/cache/ICacheData";

export const db = new Dexie("lf2") as Dexie & {
  tbl_lf2_data: EntityTable<ICacheData, "id">;
};
db.version(1).stores({
  tbl_lf2_data: "++id, name, version, data, create_date, url, type",
});

export const __Cache: ICache = {
  async list(): Promise<ICacheData[] | undefined> {
    return db
      .open()
      .catch((_) => void 0)
      .then(() => db.tbl_lf2_data.toArray());
  },
  async get(name: string): Promise<ICacheData | undefined> {
    return db
      .open()
      .then(() => db.tbl_lf2_data.where({ name }).first())
      .catch((_) => void 0);
  },
  async put(data: Omit<ICacheData, 'id' | 'create_date'>): Promise<number | void> {
    // 浏览器端：将 Uint8Array 转为 Blob 存储，避免 IndexedDB 结构化克隆大数组导致内存问题
    const record: Omit<ICacheData, 'id' | 'create_date'> = { ...data };
    if (record.data && !record.blob) {
      record.blob = new Blob([record.data.buffer as ArrayBuffer]);
      record.data = null;
    }
    return db
      .open()
      .then(() => db.tbl_lf2_data.put({
        ...record,
        create_date: Date.now(),
      }))
      .catch((_) => void 0);
  },
  async del(...names: string[]): Promise<number | void> {
    return db
      .open()
      .then(() => db.tbl_lf2_data
        .where("name")
        .anyOf(names)
        .or("url")
        .anyOf(names)
        .delete()
      ).catch((_) => void 0);
  },
  async forget(type: ICacheData["type"], version: number): Promise<number> {
    return db.open()
      .then(() => db.tbl_lf2_data
        .where({ type })
        .and(v => {
          return v.version != version
        })
        .delete()
      ).catch((_) => 0);
  }
};
