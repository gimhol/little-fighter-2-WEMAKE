/* eslint-disable react-hooks/set-state-in-effect */
import img_markdown from "@/assets/svg/markdown.svg";
import type { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { Loading } from "@/components/loading/LoadingImg";
import { type IMaskProps, Mask } from "@/components/mask";
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import csses from "./styles.module.scss";
import { ctrl_a_bounding } from "@/components/mask/ctrl_a_bounding";

export function MarkdownModal(props: { info?: Info } & IMaskProps) {
  const { info, onClose, open, container = () => document.body, ..._p } = props;
  const [loading, set_loading] = useState(false);
  const [markdown, set_markdown] = useState('');

  const ref_md_zone = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!info || !open) {
      set_markdown('');
      return;
    }

    ref_md_zone.current?.focus();
    set_loading(true)
    info.markdown()
      // .then(r => new Promise<string>(x => setTimeout(() => x(r), 5000)))
      .then(r => set_markdown(r))
      .catch(e => set_markdown('' + e))
      .finally(() => set_loading(false))
  }, [info, open])

  return (
    <Mask
      open={open}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClose={onClose}
      container={container}
      {..._p}>
      <div className={classnames(csses.changelog_md_modal)}>
        <div className={classnames(csses.right_top_zone)}>
          <IconButton
            gone={loading}
            letter="📋"
            onClick={() => navigator.clipboard.writeText(markdown)}
            title="Copy Markdown"
            stopPropagation>
          </IconButton>
          <IconButton
            letter="✖︎"
            onClick={onClose}
            title="Close"
            stopPropagation />
        </div>
        <div
          ref={ref_md_zone}
          className={classnames(csses.changelog_md_content, csses.scrollview)}
          dangerouslySetInnerHTML={{ __html: markdown }}
          onKeyDown={e => ctrl_a_bounding(e, ref_md_zone.current)}
          tabIndex={-1} />
        <Loading style={{ position: 'absolute' }} loading={loading} big />
      </div>
    </Mask>
  )
}
export function MarkdownButton(props: { info?: Info }) {
  const { info } = props;
  const [md_open, set_md_open] = useState(false);
  return (
    <>
      <IconButton onClick={() => set_md_open(true)} title="View Markdown" img={img_markdown} />
      <MarkdownModal
        info={info}
        open={md_open && !!info}
        onClose={() => set_md_open(false)} />
    </>
  )
}