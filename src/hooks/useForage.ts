import localforage from "localforage";
import { useEffect, useState } from "react";
import { useImmer } from "use-immer";
export interface IUseForageOpts<T> {
  key: string;
  version?: any;
  init: T | (() => T);
}
export function useForage<T>(opts: IUseForageOpts<T>) {
  const { key, init, version = null } = opts;
  const [value, set_value] = useImmer<T>(init)
  const [ready, set_ready] = useState(false);
  useEffect(() => {
    if (!key) set_ready(true)
    if (!key) return;
    set_ready(false);
    let unmounted = false;
    (async () => {
      const _version = await localforage.getItem(`${key}#version`);
      if (unmounted || _version !== version) return;
      const _value = await localforage.getItem<T>(key)
      if (unmounted) return;
      if (_value) set_value(_value);
    })().finally(() => {
      if (unmounted) return;
      localforage.setItem(`${key}#version`, version)
      set_ready(true);
    });
    return () => { unmounted = true }
  }, [])
  useEffect(() => {
    if (!ready || !key) return;
    if (value === null)
      localforage.removeItem(key)
    else
      localforage.setItem(key, value)
  }, [ready, value])
  return [value, set_value, ready] as const
}