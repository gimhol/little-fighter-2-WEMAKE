import type { ICacheData } from "./ICacheData";

export interface ICache {
  get(name: string): Promise<ICacheData | undefined>;
  put(data: Omit<ICacheData, 'id' | 'create_date'>): Promise<number | void>;
  del(...name: string[]): Promise<number | void>;
  list(): Promise<ICacheData[] | undefined>;
  forget(type: ICacheData['type'], version: number): Promise<number>;
}
