import img_browser_mark_white from "@/assets/img_browser_mark_white.svg";
import img_windows_x64_white from "@/assets/img_windows_x64_white.svg";
import type { Info } from "@/base/Info";
import classnames from "classnames";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../link";
import { CardBase, type ICardBaseProps } from "./CardBase";
import csses from "./DetailCard.module.scss";

export interface IDetailCardProps extends ICardBaseProps {
  info: Info;
  onClose?(): void;
}
const classNames = { card: csses.detail_card }
export function DetailCard(props: IDetailCardProps) {
  const { info, onClose, ..._p } = props;
  const { t } = useTranslation()
  const pl_in_browser = t('pl_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const { url, cover, desc, changelog } = info;
  const win_x64_url = info.get_download_url('win_x64');
  const ref_el = useRef<HTMLDivElement>(null)
  return <>
    <CardBase
      floating
      key={info.id}
      title={url ? pl_in_browser : win_x64_url ? dl_win_x64 : void 0}
      classNames={classNames}
      __ref={ref_el}
      {..._p}>
      <div className={csses.detail_card_inner}>
        <div className={csses.detail_card_head}>
          <div className={csses.left}>
            <Link href={url} style={{ padding: `0px 5px` }}>
              {info.title}{url ? ' ▸' : null}
            </Link>
            <span className={csses.prefix}>
              {url ? pl_in_browser : t('version_unavailable')}
            </span>
          </div>
          <div className={csses.mid}></div>
          <div className={csses.right}>
            {!url ? null :
              <Link title={pl_in_browser} href={url} >
                <img src={img_browser_mark_white} width="16px" draggable={false} alt={pl_in_browser} />
              </Link>
            }
            {!win_x64_url ? null :
              <Link title={dl_win_x64} href={win_x64_url}>
                <img src={img_windows_x64_white} width="16px" draggable={false} alt={dl_win_x64} />
              </Link>
            }
            {
              !onClose ? null :
                <Link onClick={e => { e.stopPropagation(); onClose?.() }}>
                  ✖︎
                </Link>
            }
          </div>
        </div>
        <div className={csses.detail_card_main}>
          {
            !cover ? null : <div className={classnames(csses.pic_zone)}>
              <img draggable={false} src={cover} />
            </div>
          }
          {
            !(desc || changelog) ? null :
              <div className={classnames(cover ? csses.info_zone_half : csses.info_zone, csses.scrollview)}>
                {!desc ? null : <div dangerouslySetInnerHTML={{ __html: desc }} />}
                {!desc || !changelog ? null : <div>Changelog</div>}
                {!changelog ? null : <><div dangerouslySetInnerHTML={{ __html: changelog }} /></>}
              </div>
          }
          {
            (cover || desc || changelog) ? null :
              <div className={classnames(csses.no_content)}>
                {t('no_content')}
              </div>
          }
        </div>
        <div className={csses.detail_card_foot}>
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
  </>
}