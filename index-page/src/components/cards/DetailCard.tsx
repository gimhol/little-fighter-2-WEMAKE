import img_windows_x64_white from "@/assets/img_windows_x64_white.svg";
import { Info } from "@/base/Info";
import classnames from "classnames";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../link";
import { Viewer } from "../markdown/Viewer";
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
  const open_in_browser = t('open_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const { url, cover, desc, desc_url, changelog_url, changelog, unavailable, url_type } = info;
  const win_x64_url = info.get_download_url('win_x64');
  const ref_el = useRef<HTMLDivElement>(null)

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
      title={url ? open_in_browser : win_x64_url ? dl_win_x64 : void 0}
      classNames={classNames}
      __ref={ref_el}
      {..._p}>
      <div className={csses.detail_card_inner}>
        <div className={csses.detail_card_head}>
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
            !cover ? null : <img className={classnames(csses.pic_zone)} draggable={false} src={cover} />
          }
          {
            !(desc || changelog || desc_url || changelog_url) ? null :
              <div className={classnames(csses.info_zone, csses.scrollview)}>
                {(desc || desc_url) ? <Viewer content={desc} url={desc_url} /> : void 0}
                {(changelog || changelog_url) ? <Viewer content={changelog} url={changelog_url} /> : void 0}
              </div>
          }
          {
            (cover || desc || changelog || desc_url || changelog_url) ? null :
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