import img_browser_mark_white from "@/assets/svg/browser.svg";
import windows_x64 from "@/assets/svg/windows_x64.svg";
import { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { Collapse } from "@/components/collapse/Collapse";
import { Link } from "@/components/link";
import { Viewer } from "@/components/markdown/Viewer";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./InfoView.module.scss";
import { MarkdownButton } from "./MarkdownModal";
export interface IInfoViewProps {
  info: Info;
  open?: boolean;
  whenOpen?(open: boolean): void
}
export function InfoView(props: IInfoViewProps) {
  const { info, open, whenOpen } = props;
  const { t } = useTranslation()
  const { url, unavailable, url_type } = info;
  const win_x64_url = info.get_download_url('win_x64')
  const open_in_browser = t('open_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const [_open, _set_open] = useState(open)
  const __open = whenOpen ? open : _open;
  const __set_open = whenOpen ? whenOpen : _set_open;
  const title_suffix = unavailable ? t('unavailable') : url_type ? t(url_type) : void 0;
  const has_content = !!(info?.desc || info.desc_url || info.changelog || info.changelog_url)
  return (
    <div className={csses.info_view_root} key={info.id}>
      <div className={csses.row_1}>
        <h3 className={csses.row_title}>
          <Link href={url}>
            {info.title}
          </Link>
          <span className={csses.suffix}>
            {title_suffix}
          </span>
        </h3>
        <div className={csses.go_div}>
          <MarkdownButton info={info} />
          <IconButton title={open_in_browser} href={url} gone={!url} img={img_browser_mark_white} />
          <IconButton title={dl_win_x64} href={win_x64_url} gone={!win_x64_url} img={windows_x64} />
          <IconButton gone={!has_content} style={{ transform: `rotateZ(${__open ? 0 : 180}deg)` }} onClick={() => __set_open(!__open)} title="▼ or ▲" letter="▲" />
          <div className={csses.el_date}>
            {info.date}
          </div>
        </div>
      </div>
      <Collapse open={__open && has_content}>
        <Viewer
          emptyAsGone
          content={info?.desc}
          url={info.desc_url}
          whenLoaded={t => info.set_desc(t)} />
        <Viewer
          emptyAsGone
          content={info?.changelog}
          url={info.changelog_url}
          whenLoaded={t => info.set_changelog(t)} />
      </Collapse>
    </div>
  )
}