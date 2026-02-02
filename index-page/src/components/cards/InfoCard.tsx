import img_windows_x64_white from "@/assets/img_windows_x64_white.svg";
import { Info } from "@/base/Info";
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
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
  const open_in_browser = t('open_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const { info } = props;
  const { url, url_type, cover, desc, changelog, unavailable, desc_url, changelog_url } = info;
  const win_x64_url = info.get_download_url('win_x64');
  const ref_el = useRef<HTMLDivElement>(null)
  const [test_mask_style, set_test_mask] = useState<React.CSSProperties>({})
  const [detail_open, set_test_mask_open] = useState(false)

  useEffect(() => {
    if (!detail_open) return void 0
    setTimeout(() => {
      set_test_mask(prev => {
        return {
          ...prev,
          left: 50, top: 50,
          width: 'calc(100% - 100px)',
          height: 'calc(100% - 100px)'
        }
      })
    }, 50)

  }, [detail_open])
  const close_detail = () => {
    set_test_mask_open(false)
    const { width, height, left, top } = ref_el.current!.firstElementChild!.getBoundingClientRect()
    set_test_mask({ position: 'fixed', width, height, left, top, transition: 'all 255ms' })
  }
  const open_detail = () => {
    set_test_mask_open(true)
    const { width, height, left, top } = ref_el.current!.firstElementChild!.getBoundingClientRect()
    set_test_mask({ position: 'fixed', width, height, left, top, transition: 'all 255ms' })
  }
  const mask = createPortal(<>
    <Mask
      open={detail_open}
      closeOnMask
      onClose={close_detail}>
      <DetailCard
        floating={false}
        info={info}
        style={test_mask_style}
        styles={{ card: { width: '100%', height: '100%' } }}
        onClick={e => {
          e.stopPropagation()
        }}
        onClose={close_detail}
      />
    </Mask>

  </>, document.body)

  const markdown = desc || changelog;
  const markdown_url = desc_url || changelog_url;

  const txts: { [x in string]?: string } = {
    [Info.OPEN_IN_BROWSER]: open_in_browser
  }

  const title_suffix =
    <span className={csses.prefix}>
      {unavailable ? t('unavailable') : url_type ? (txts[url_type] || url_type) : ''}
    </span>
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
            <Link href={url} style={{ padding: `0px 5px` }}>
              {info.title}
              {url_type === Info.OPEN_IN_BROWSER && url ? ' ▸' : null}
            </Link>
            {title_suffix}
          </div>
          <div className={csses.mid}></div>
          <div className={csses.right}>

            {!win_x64_url ? null :
              <Link title={dl_win_x64} href={win_x64_url}>
                <img src={img_windows_x64_white} width="16px" draggable={false} alt={dl_win_x64} />
              </Link>
            }
          </div>
        </div>
        <div className={csses.info_card_main}>
          {
            !cover ? null : <img className={classnames(csses.pic_zone)} draggable={false} src={cover} />
          }
          {
            !(markdown || markdown_url) ? null :
              <div className={classnames(cover ? csses.info_zone_half : csses.info_zone, csses.scrollview)}>
                <Viewer plain content={markdown} url={markdown_url} />
              </div>
          }
          {
            (cover || desc || changelog || markdown_url) ? null :
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
    {mask}
  </>
}