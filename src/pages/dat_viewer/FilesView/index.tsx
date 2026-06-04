import List from "rc-virtual-list";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../Component/Buttons/Button";
import Frame from "../../../Component/Frame";

export interface IFilesViewProps {
  files: File[];
  onClick?: (file: File) => void;
}
export function FilesView(props: IFilesViewProps) {
  const { files } = props;
  const ref_el = useRef<HTMLDivElement>(null);
  const [height, set_height] = useState(0)
  useEffect(() => {
    const el = ref_el.current;
    if (!el) return;
    const on_resize = () => {
      set_height(el.getBoundingClientRect().height || 0)
    }
    const ob = new ResizeObserver(on_resize)
    ob.observe(el)
    on_resize();
    return () => ob.disconnect()
  }, [])
  return (
    <Frame
      style={{
        height: '100%',
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        flexDirection: 'column',
        overflow: 'hidden',
        display: 'flex',
      }}
      label="文件列表"
      variants={['no_border', 'no_shadow', 'no_round']}>
      <div ref={ref_el} style={{ position: 'relative', overflow: 'hidden', height: 1, flex: 1 }}>
        <List
          data={files}
          height={height}
          itemHeight={32}
          itemKey="name"
          styles={{ verticalScrollBarThumb: { backgroundColor: 'rgba(0,0,0,0.2)' } }}
          virtual
          style={{ resize: 'horizontal', width: '100%' }}>
          {(file) => (
            <Button
              styles={{ inner: { textAlign: 'left', width: '100%' } }}
              variants={['no_border', 'no_shadow', 'no_round']}
              onClick={e => {
                props.onClick?.(file);
                e.stopPropagation();
                e.preventDefault();
              }}>
              {file.webkitRelativePath}
            </Button>
          )}
        </List>
      </div>
    </Frame >
  )
}