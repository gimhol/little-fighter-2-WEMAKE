import { marked } from "marked";
import { useEffect, useState } from "react";
import classnames from "classnames";
import csses from "./Viewer.module.scss";

export interface IViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string;
  url?: string;
  plain?: boolean
}
export function Viewer(props: IViewerProps) {
  const { content, className, plain = false, url, ..._p } = props;
  const [__html, set_html] = useState<string>('')

  useEffect(() => {
    if (!url) {
      Promise.resolve(marked.parse(content || ''))
        .then(v => set_html(v))
      return;
    }
    const ab = new AbortController()
    fetch(url, { signal: ab.signal })
      .then(r => r.text())
      .then((txt) => marked.parse(txt))
      .then((v) => set_html(v))
      .catch(e => console.warn(e))
    return () => ab.abort();
  }, [url, content])

  return (
    <div
      {..._p}
      className={classnames(csses.viewer, { [csses.plain]: plain }, className)}
      dangerouslySetInnerHTML={{ __html }} />
  )
}