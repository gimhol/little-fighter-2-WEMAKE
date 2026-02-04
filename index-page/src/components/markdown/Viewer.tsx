import classnames from "classnames";
import { marked } from "marked";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import csses from "./Viewer.module.scss";


function useMarked() {
  return [
    useMemo(() => {
      const renderer = new marked.Renderer();
      renderer.link = ({ href, title, text }) => {
        const a = document.createElement('a');
        a.href = href;
        a.setAttribute('data-href', href)
        a.innerText = text;
        a.target = '_blank';
        if (title) a.title = title;
        return a.outerHTML
      }
      return marked.options({ renderer })
    }, [])
  ]
}

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
  const ref_el = useRef<HTMLDivElement>(null);
  const [marked] = useMarked();
  const [__html, set_html] = useState<string>('');
  const nav = useNavigate();

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
      ref={ref_el}
      className={classnames(csses.viewer, { [csses.plain]: plain }, className)}
      dangerouslySetInnerHTML={{ __html }}
      onClick={e => {
        const link = (e.target as Element).closest("a");
        const href = link?.getAttribute('data-href')
        if (href?.startsWith('/')) {
          console.log(href)
          nav({ pathname: href })
          e.preventDefault();
          e.stopPropagation();
        }
      }} />
  )
}