import Dexie, { EntityTable } from "dexie";
import { ICache } from "@/LF2/ditto/cache";
import { ICacheData } from "@/LF2/ditto/cache/ICacheData";

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
    return db
      .open()
      .then(() => db.tbl_lf2_data.put({
        ...data,
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
