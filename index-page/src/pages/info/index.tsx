import img_browser_mark_white from "@/assets/svg/browser.svg";
import windows_x64 from "@/assets/svg/windows_x64.svg";
import { Info } from "@/base/Info";
import { CollapseButton } from "@/components/button/CollapseButton";
import { IconButton } from "@/components/button/IconButton";
import { InfoCard } from "@/components/cards/InfoCard";
import { Collapse } from "@/components/collapse/Collapse";
import { Link } from "@/components/link";
import { Viewer } from "@/components/markdown/Viewer";
import { usePropState } from "@/utils/usePropState";
import classnames from "classnames";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownButton } from "../main/MarkdownModal";
import csses from "./styles.module.scss";
import { useInfoChildren } from "./useInfoChildren";

type ListLike = 'cards' | 'list';
function curr_list_like(v: string | undefined | null): ListLike {
  return v === 'cards' ? 'cards' : 'list'
}
function next_list_like(v: string | undefined | null): ListLike {
  return v === 'cards' ? 'list' : 'cards'
}
export interface IInfoViewProps extends React.HTMLAttributes<HTMLDivElement> {
  info: Info;
  open?: boolean;
  whenOpen?(open: boolean): void;
  listLike?: ListLike;
  whenListLike?(v: ListLike): void;
}

export function InfoView(props: IInfoViewProps) {
  const {
    info, className,
    open, whenOpen,
    listLike = curr_list_like(info.type), whenListLike,
    ..._p
  } = props;
  const [__open, __set_open] = usePropState(open, whenOpen)
  const [__listLike, __set_listLike] = usePropState(listLike, whenListLike)

  console.log(info.title, __listLike)
  useEffect(() => {
    if (whenListLike) return;
    const listlike = curr_list_like(info.type)
    __set_listLike(listlike)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info])

  const { t } = useTranslation()
  const { unavailable, unavailable_reason } = info;
  const win_x64_url = info.get_download_url('win_x64')
  const open_in_browser = t('open_in_browser')
  const dl_win_x64 = t('dl_win_x64')
  const ref_el_children = useRef<HTMLDivElement>(null);
  const has_content = !!(info?.desc || info.desc_url || info.changelog || info.changelog_url)
  const [children] = useInfoChildren(info)
  const __next_list_like = next_list_like(__listLike)
  const cls_root = classnames(csses.info_view_root, className)
  const url = info.url ?? children?.find(v => v.url)?.url;
  const url_type = info.url ? info.url_type : children?.find(v => v.url)?.url_type;
  const tags = unavailable ? [t(unavailable_reason || 'unavailable')] : url_type ? [t(url_type)] : void 0;
  return (
    <div className={cls_root} {..._p}>
      <div className={csses.head}>
        <CollapseButton
          open={__open}
          whenChange={__set_open}
          className={!has_content ? csses.collapse_btn_hide : void 0} />
        <h3 className={csses.title}>
          <Link className={csses.title_link} href={url}>
            {info.title}
          </Link>
          {tags?.map(v => <span className={csses.tag} key={v}> {v} </span>)}
        </h3>
        <div className={csses.head_right_zone}>
          <IconButton title={open_in_browser} href={url} gone={!url} img={img_browser_mark_white} />
          <IconButton title={dl_win_x64} href={win_x64_url} gone={!win_x64_url} img={windows_x64} />
          <IconButton
            gone={!(children?.length)}
            onClick={() => __set_listLike(__next_list_like)}
            title="Cards or List"
            letter={__next_list_like.charAt(0).toUpperCase()} />
          <MarkdownButton info={info} />
          <div className={csses.el_date}>
            {info.date}
          </div>
        </div>
      </div>
      <Collapse open={__open && has_content} className={csses.content_zone} >
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
      {
        children.length ?
          <div className={csses.children_title_div} style={{ height: 0 }}>
            <span className={csses.children_title}>
              <IconButton letter="⬆" title={`scroll ${info.children_title} to top`}
                onClick={() => ref_el_children.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
              <span>{info.children_title}</span>
              <IconButton letter="⬇"  title={`scroll ${info.children_title} to bottom`}
                onClick={() => ref_el_children.current?.scrollTo({ top: ref_el_children.current.scrollHeight, behavior: 'smooth' })} />
            </span>
          </div> : null
      }
      {
        (__listLike !== 'cards' || !children?.length) ? null :
          <div className={classnames(csses.card_list, csses.scrollview)} ref={ref_el_children}>
            {children?.map(version => <InfoCard info={version} key={version.id} />)}
          </div>
      }
      {
        (__listLike !== 'list' || !children?.length) ? null :
          <div className={classnames(csses.version_list, csses.scrollview)} ref={ref_el_children}>
            {
              children.map((version, idx) => {
                return <InfoView info={version} key={version.id} open={idx === 0} />
              })
            }
          </div>
      }
    </div>
  )
}