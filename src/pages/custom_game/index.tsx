import { Button } from "@/Component/Buttons/Button";
import { Ditto, IZip, LF2 } from "@/LF2";
import { Paths } from "@/Paths";
import { open_file } from "@/Utils/open_file";
import json5 from "json5";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import styles from "./styles.module.scss";

export default function CustomGamePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const load_file = async (file: File) => {
    try {
      const zip = await Ditto.Zip.read_file(file)
      const index_json = zip.file('index.json') || zip.file('index.json5')
      if (!index_json) throw new Error('"index.json" or "index.json5" not found')
      const paths = await index_json.text().then(str => json5.parse(str))
      if (!Array.isArray(paths) || paths.length < 2 || paths.some(path => typeof path !== 'string'))
        throw new Error('content of "index.json" should be a string array')
      let prel: IZip | null = null;
      let datas: IZip[] = []
      for (const path of paths) {
        const file = zip.file(path)
        if (!file) throw new Error(`"${path}" not found`)
        const buf = await file.uint8_array();
        const z = await Ditto.Zip.read_buf(path, buf)
        if (!prel) prel = z;
        else datas.push(z);
      }
      if (!prel) throw new Error(`prel got ${null}`)
      if (!datas.length) throw new Error(`prel got ${null}`)
      LF2.PREL_ZIPS = [prel];
      LF2.DATA_ZIPS = datas;
      nav(Paths.All.game)
    } catch (e) {
      alert('' + e)
    }
  }
  const on_click = async () => {
    try {
      const [file] = await open_file({ accept: '.zip' });
      if (!file) return;
      load_file(file)
    } catch (e) {
      alert('' + e)
    }
  }
  const on_drop = async (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const { items } = e.dataTransfer;
      if (items.length > 1)
        throw new Error('multiple files are not supported')
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind !== 'file')
          throw new Error('what you dragged in is not a file')
      }
      const file = items[0].getAsFile()
      if(!file) throw new Error(`file got ${file}?? why?`)
      load_file(file)
    } catch (e) {
      alert('' + e)
    }
  }
  return (
    <div
      className={styles.custom_game_page}
      onDragOver={e => e.preventDefault()}
      onDrop={e => e.preventDefault()}>
      <Button
        className={styles.hello_world}
        onClick={on_click}
        onDragOver={e => e.preventDefault()}
        onDrop={on_drop}>
        <h1>{t("custom_game")}</h1>
        <div>{t("pls_drag_game_zip_in_here")}</div>
      </Button>
    </div >
  )
}