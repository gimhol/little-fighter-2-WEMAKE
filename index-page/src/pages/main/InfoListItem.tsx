import img_browser_mark_white from "@/assets/img_browser_mark_white.svg";
import img_windows_x64_white from "@/assets/img_windows_x64_white.svg";
import { Info } from "@/base/Info";
import { Link } from "@/components/link";
import { Viewer } from "@/components/markdown/Viewer";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./InfoListItem.module.scss";

export function InfoListItem(props: { info: Info }) {
  const { info: info } = props;
  const { t } = useTranslation()
  const { url } = info;
  const win_x64_url = info.get_download_url('win_x64')
  const open_in_browser = t('open_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const [game_desc_open, set_game_desc_open] = useState(true)
  return (
    <div className={csses.info_list_item_root} key={info.id}>
      <div className={csses.row_1}>
        <h3 className={csses.row_title}>
          <Link href={url}>
            {info.title}
            {url ? null : ` (${t('unavailable')})`}
          </Link>
        </h3>
        <div className={csses.go_div}>
          {!url ? null :
            <Link title={open_in_browser} href={url}>
              <img src={img_browser_mark_white} width="24px" alt={open_in_browser} />
            </Link>
          }
          {!win_x64_url ? null :
            <Link title={dl_win_x64} href={win_x64_url}>
              <img src={img_windows_x64_white} width="24px" alt={dl_win_x64} />
            </Link>
          }
          <button className={csses.btn} onClick={() => set_game_desc_open(!game_desc_open)} title="▼ or ▲">
            <span className={csses.btn_span} style={{ transform: `rotateZ(${game_desc_open ? 0 : 180}deg)` }}>▲</span>
          </button>
          <div className={csses.el_date}>
            {info.date}
          </div>
        </div>
      </div>
      {game_desc_open ? <>
        <Viewer content={info?.desc} url={info.desc_url} whenLoaded={t => info.desc = t} emptyAsGone />
        <Viewer content={info?.changelog} url={info.changelog_url} whenLoaded={t => info.changelog = t} emptyAsGone />
      </> : null}

    </div>
  )
}