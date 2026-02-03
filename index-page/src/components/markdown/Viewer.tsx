import classnames from "classnames";
import { marked } from "marked";
import { useEffect, useState } from "react";
import csses from "./Viewer.module.scss";

export interface IViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string;
  url?: string;
  plain?: boolean;
  emptyAsGone?: boolean;
  whenLoaded?(txt: string): void;
}
export function Viewer(props: IViewerProps) {
  const {
    content, className, emptyAsGone = false, plain = false, url, whenLoaded, ..._p
  } = props;
  const [__html, set_html] = useState<string>('')
  useEffect(() => {
    if (!url) {
      Promise.resolve(marked.parse(content || ''))
        .then(v => set_html(v))
      return;
    }
    const ab = new AbortController()
    fetch(url, { signal: ab.signal, mode: 'cors' })
      .then(r => r.text())
      .then((txt) => {
        whenLoaded?.(txt);
        return marked.parse(txt)
      })
      .then((v) => set_html(v))
      .catch(e => console.warn(e))
    return () => ab.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, content])

  if (emptyAsGone && !__html) return <></>
  return (
    <div
      {..._p}
      className={classnames(csses.viewer, { [csses.plain]: plain }, className)}
      dangerouslySetInnerHTML={{ __html }} />
  )
}