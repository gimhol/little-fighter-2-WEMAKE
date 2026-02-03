import windows_x64 from "@/assets/svg/windows_x64.svg";
import { Info } from "@/base/Info";
import { MarkdownButton } from "@/pages/main/MarkdownModal";
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../button/IconButton";
import { Link } from "../link";
import { Viewer } from "../markdown/Viewer";
import { Mask } from "../mask";
import { CardBase, type ICardBaseProps } from "./CardBase";
import { DetailCard } from "./DetailCard";
import csses from "./InfoCard.module.scss";

export interface IInfoCardProps extends ICardBaseProps {
  info: Info
}
const classNames = { card: csses.info_card }
export function InfoCard(props: IInfoCardProps) {
  const { t } = useTranslation()
  const dl_win_x64 = t('dl_win_x64')
  const { info } = props;
  const { url, url_type, cover, unavailable } = info;
  const win_x64_url = info.get_download_url('win_x64');
  const ref_el = useRef<HTMLDivElement>(null)
  const [detail_style, set_detail_style] = useState<React.CSSProperties>({})
  const [detail_open, set_detail_open] = useState(false)
  const title_suffix = unavailable ? t('unavailable') : url_type ? t(url_type) : void 0;
  useEffect(() => {
    if (!detail_open) return void 0
    setTimeout(() => set_detail_style({}), 50)
  }, [detail_open])
  const close_detail = () => {
    set_detail_open(false)
    const { width, height, left, top } = ref_el.current!.firstElementChild!.getBoundingClientRect()
    set_detail_style({ width, height, left, top })
  }
  const open_detail = () => {
    set_detail_open(true)
    const { width, height, left, top } = ref_el.current!.firstElementChild!.getBoundingClientRect()
    set_detail_style({ width, height, left, top })
  }
  return <>
    <CardBase
      floating
      key={info.id}
      onClick={open_detail}
      classNames={classNames}
      __ref={ref_el}>
      <div className={csses.info_card_inner}>
        <div className={csses.info_card_head}>
          <div className={csses.left}>
            <Link className={csses.title} href={url}>
              {info.title}
              {url_type === Info.OPEN_IN_BROWSER && url ? ' ▸' : null}
            </Link>
            <span className={csses.suffix}>
              {title_suffix}
            </span>
          </div>
          <div className={csses.mid}></div>
          <div className={csses.right}>
            <MarkdownButton info={info} />
            <IconButton title={dl_win_x64} href={win_x64_url} gone={!win_x64_url} img={windows_x64} />
          </div>
        </div>
        <div className={csses.info_card_main}>
          {
            !cover ? null : <img className={classnames(csses.pic_zone)} draggable={false} src={cover} />
          }
          {
            !(info.desc || info.desc_url || info.changelog || info.changelog_url) ? null :
              <div className={classnames(cover ? csses.info_zone_half : csses.info_zone, csses.scrollview)}>
                <Viewer plain content={info.desc} url={info.desc_url} whenLoaded={v => info.set_desc(v)} />
                <Viewer plain content={info.changelog} url={info.changelog_url} whenLoaded={v => info.set_changelog(v)} />
              </div>
          }
          {
            (cover || info.desc || info.desc_url || info.changelog || info.changelog_url) ? null :
              <div className={classnames(csses.no_content)}>{t('no_content')}</div>
          }
        </div>
        <div className={csses.info_card_foot}>
          <div className={csses.left}>
            <span className={csses.prefix}>
              {t('author')}
            </span>
            <Link
              href={info.author_url}
              title={t('visit_author_link')}>
              {info.author}
            </Link>
          </div>
          <div className={csses.mid}>
          </div>
          <div className={csses.right}>
            <span className={csses.prefix}>
              {t('date')}
            </span>
            {info.date}
          </div>
        </div>
      </div>
    </CardBase>

    <Mask
      container={() => document.body}
      open={detail_open}
      closeOnMask
      onClose={close_detail}>
      <DetailCard
        floating={false}
        info={info}
        classNames={{
          root: csses.detail_card_modal,
          card: csses.detail_card_inner,
        }}
        style={detail_style}
        onClick={e => e.stopPropagation()}
        onClose={close_detail}
      />
    </Mask>
  </>
}