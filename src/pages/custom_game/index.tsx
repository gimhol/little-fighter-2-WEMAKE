import { Button } from "@/Component/Buttons/Button";
import { Ditto, IZip, LF2 } from "@/LF2";
import { Paths } from "@/Paths";
import { open_file } from "@/Utils/open_file";
import json5 from "json5";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import styles from "./styles.module.scss";
import { useRef } from "react";
import { download } from "@/Utils/download";

export default function CustomGamePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const load_file = async (file: File) => {
    try {
      const zip = await Ditto.Zip.read_file(file)
      const index_json = zip.file('index.json') || zip.file('index.json5')
      if (!index_json) throw new Error(t('custom_game_load_file_err_0'))
      const paths = await index_json.text().then(str => json5.parse(str))
      if (!Array.isArray(paths) || paths.length < 2 || paths.some(path => typeof path !== 'string'))
        throw new Error(t('custom_game_load_file_err_1'))

      let datas: IZip[] = []
      for (const path of paths) {
        const file = zip.file(path)
        if (!file) throw new Error(t('custom_game_load_file_err_2').replace('%1', JSON.stringify(path)))
        const buf = await file.uint8_array();
        const z = await Ditto.Zip.read_buf(path, buf)
        datas.push(z);
      }
      if (datas.length < 2) throw new Error(`datas got empty!`)
      LF2.PREL_ZIPS = [datas[0]];
      LF2.DATA_ZIPS = datas.slice(1);
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
  const ref_hello_world = useRef<HTMLButtonElement>(null)
  const get_zip_file = (e: React.DragEvent): boolean => {
    const { items } = e.dataTransfer;
    if (items.length != 1) return false;
    return items[0].type === 'application/x-zip-compressed'
  }
  const on_drop = async (e: React.DragEvent) => {
    if (ref_hello_world.current) ref_hello_world.current.style.borderStyle = ''
    e.preventDefault();
    try {
      const { items } = e.dataTransfer;
      if (items.length > 1)
        throw new Error(t('custom_game_drop_err_0'))
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind !== 'file')
          throw new Error(t('custom_game_drop_err_1'))
      }
      const file = items[0].getAsFile()
      if (!file) throw new Error(t('custom_game_drop_err_1').replace('%1', '' + file))
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
        _ref={ref_hello_world}
        className={styles.hello_world}
        onClick={on_click}
        onDragEnter={e => {
          if (ref_hello_world.current && get_zip_file(e)) {
            ref_hello_world.current.style.borderStyle = 'solid'
            ref_hello_world.current.style.color = 'white'
          }
        }}
        onDragLeave={e => {
          if (ref_hello_world.current && get_zip_file(e)) {
            ref_hello_world.current.style.borderStyle = ''
            ref_hello_world.current.style.color = ''
          }
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={on_drop}>
        <h1>{t("custom_game")}</h1>
        <div>{t("pls_drag_game_zip_in_here")}</div>
      </Button>
      <Button onClick={() => download('lfw.full.zip')}>
        {t("download_origin_full_zip_here")}
      </Button>
    </div >
  )
}