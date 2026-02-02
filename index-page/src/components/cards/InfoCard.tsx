import img_browser_mark_white from "@/assets/img_browser_mark_white.svg";
import img_windows_x64_white from "@/assets/img_windows_x64_white.svg";
import type { Info } from "@/base/Info";
import { open_link } from "@/utils/open_link";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { Link } from "../link";
import { CardBase, type ICardBaseProps } from "./CardBase";
import styles from "./InfoCard.module.scss";

export interface IInfoCardProps extends ICardBaseProps {
  info: Info
}
export function InfoCard(props: IInfoCardProps) {
  const { t } = useTranslation()
  const pl_in_browser = t('pl_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const { info: version } = props;
  const { url, cover, desc, changelog } = version;
  const win_x64_url = version.get_download_url('win_x64');
  const default_url = url ?? win_x64_url;
  return (
    <CardBase
      key={version.id}
      title={url ? pl_in_browser : win_x64_url ? dl_win_x64 : void 0}
      onClick={() => open_link(default_url)}>
      <div className={styles.info_card}>
        <div className={styles.info_card_head}>
          <div className={styles.left}>
            <Link href={url}>
              {version.title}
              <span className={styles.prefix}>
                {url ? null : ` (${t('version_unavailable')})`}
              </span>
            </Link>
          </div>
          <div className={styles.mid}></div>
          <div className={styles.right}>
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
          </div>
        </div>
        <div className={styles.info_card_main}>
          {
            !cover ? null : <div className={classnames(styles.pic_zone)}>
              <img draggable={false} src={cover} />
            </div>
          }
          {
            !(desc || changelog) ? null :
              <div className={classnames(cover ? styles.info_zone_half : styles.info_zone, styles.scrollview)}>
                {!desc ? null : <div dangerouslySetInnerHTML={{ __html: desc }} />}
                {!desc || !changelog ? null : <div>Changelog</div>}
                {!changelog ? null : <><div dangerouslySetInnerHTML={{ __html: changelog }} /></>}
              </div>
          }
          {
            (cover || desc || changelog) ? null :
              <div className={classnames(styles.no_content)}>
                {t('no_content')}
              </div>
          }
        </div>
        <div className={styles.info_card_foot}>
          <div className={styles.left}>
            <span className={styles.prefix}>
              {t('author')}
            </span>
            <Link
              href={version.author_url}
              title={t('visit_author_link')}>
              {version.author}
            </Link>
          </div>
          <div className={styles.mid}>
          </div>
          <div className={styles.right}>
            <span className={styles.prefix}>
              {t('date')}
            </span>
            {version.date}
          </div>
        </div>
      </div>
    </CardBase>
  )
}