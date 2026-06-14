import { Button } from "@/Component/Buttons/Button";
import { LF2 } from "@/LF2";
import { Paths } from "@/Paths";
import { download } from "@/Utils/download";
import { open_file } from "@/Utils/open_file";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { read_as_full_game_zip } from "./read_as_full_game_zip";
import csses from "./styles.module.scss";

export default function CustomGamePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const load_file = async (file: File) => {
    try {
      const [info, zips] = await read_as_full_game_zip(file)
      LF2.INFO = info
      LF2.ZIPS = zips;
      nav(Paths.All.game, { replace: true })
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
  const return_to_game = () => {
    nav(Paths.All.game, { replace: true })
  }
  return (
    <div
      className={csses.custom_game_page}
      onDragOver={e => e.preventDefault()}
      onDrop={e => e.preventDefault()}>
      <Button
        _ref={ref_hello_world}
        className={csses.hello_world}
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
        <div style={{ whiteSpace: 'pre-wrap' }}>{t("pls_drag_game_zip_in_here")}</div>
      </Button>
      <div className={csses.bottom_row}>
        <Button onClick={return_to_game}>
          {t("return_to_game")}
        </Button>
        <Button onClick={() => download('lfw.full.zip')}>
          {t("download_origin_full_zip_here")}
        </Button>
      </div>
    </div >
  )
}