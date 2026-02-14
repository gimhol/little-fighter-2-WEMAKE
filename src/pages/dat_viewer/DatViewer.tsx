import json5 from "json5";
import { useCallback, useEffect, useRef, useState } from "react";
import { Slot } from "splittings/dist/es/splittings";
import { Button } from "../../Component/Buttons/Button";
import { Flex } from "../../Component/Flex";
import Frame from "../../Component/Frame";
import { ITextAreaRef, TextArea } from "../../Component/TextArea";
import dat_to_json from "@/LF2/dat_translator/dat_2_json";
import decode_lf2_dat from "@/LF2/dat_translator/decode_lf2_dat";
import { read_indexes } from "@/LF2/dat_translator/read_indexes";
import { IDataLists } from "@/LF2/defines";
import { open_dir, read_file } from "../../Utils/open_file";
import { FilesView } from "./FilesView";
import { useWorkspaces } from "./useWorkspaces";

export interface IDatViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  open?: boolean;
}
export function DatViewer(props: IDatViewerProps) {
  const { onClose, loading, open, ..._p } = props;
  const _ref_textarea_dat = useRef<ITextAreaRef>(null);
  const _ref_textarea_json = useRef<ITextAreaRef>(null);
  const _ref_txt_dat = useRef<string>("");
  const _ref_txt_json = useRef<string>("");
  const [files, set_files] = useState<File[]>([])
  const ref_data_indexes = useRef<IDataLists | null>(null)
  const on_click_open_dir = async () => {
    const files = await open_dir();
    set_files(files)
    const data_txt = files.find(v => v.name === 'data.txt')
    if (data_txt) on_click_file(data_txt)
  }
  const on_click_file = async (file: File) => {
    if (file.name.endsWith(".txt")) {
      const txt = await read_file(file, { as: "Text" }).then(v => v.replace(/\r/g, ""));
      const data_indexes = read_indexes(txt, 'json5')
      if (typeof data_indexes == 'string')
        console.error(data_indexes)
      else
        ref_data_indexes.current = data_indexes;
      _ref_txt_dat.current = txt;
      _ref_txt_json.current = json5.stringify(data_indexes, null, 2);
      if (_ref_textarea_dat.current)
        _ref_textarea_dat.current.value = _ref_txt_dat.current;
      if (_ref_textarea_json.current)
        _ref_textarea_json.current.value = _ref_txt_json.current;
    } else if (file.name.endsWith(".dat")) {
      const buf = await read_file(file, { as: "ArrayBuffer" });
      const str_dat = await decode_lf2_dat(buf);
      const json5_file_name = 'data/' + file.name.replace(/\.dat$/, ".json5").replace(/\\/g, "/");
      const index_info =
        ref_data_indexes.current?.objects.find((v) => json5_file_name === v.file) ||
        ref_data_indexes.current?.backgrounds.find((v) => json5_file_name === v.file);
      if (!index_info) debugger
      const data = dat_to_json(str_dat, index_info!);
      _ref_txt_dat.current = str_dat;
      _ref_txt_json.current = json5.stringify(data, null, 2);
      if (_ref_textarea_dat.current)
        _ref_textarea_dat.current.value = _ref_txt_dat.current;
      if (_ref_textarea_json.current)
        _ref_textarea_json.current.value = _ref_txt_json.current;
    }
  }
  const ref_container = useRef<HTMLDivElement>(null);
  const { context, workspace, set_container } = useWorkspaces({
    container: ref_container.current,
    render: useCallback((slot: Slot, el: HTMLElement, idx: number) => {
      switch (slot.id) {
        case 'files':
          return <FilesView files={files} onClick={on_click_file} />
        case 'dat_txt':
          return (
            <TextArea
              variants={['no_border', 'no_shadow', 'no_round']}
              ref={_ref_textarea_dat}
              wrap="off"
              style={{ resize: 'none', width: '100%', height: '100%' }} />
          )
        case 'json5_txt':
          return (
            <TextArea
              variants={['no_border', 'no_shadow', 'no_round']}
              ref={_ref_textarea_json}
              wrap="off"
              style={{ resize: 'none', width: '100%', height: '100%' }} />
          )
      }
      return <>{slot.id}</>
    }, [files]),
    key: useCallback((slot: Slot, el: HTMLElement, idx: number) => 'slot_' + slot.id || idx, [])
  })

  useEffect(() => set_container(ref_container.current), [])
  useEffect(() => {
    if (!workspace) return
    workspace.add(0, 0, { id: 'files' })
    workspace.add('files', "right", { id: 'dat_txt' })
    workspace.add('dat_txt', "down", { id: 'json5_txt' })
    workspace.confirm()
    return () => {
      workspace.del('files')
      workspace.del('dat_txt')
      workspace.del('json5_txt')
    }
  }, [workspace])

  if (!open) return <></>;
  return (
    <Flex direction="column" align='stretch' {..._p}>
      <Frame
        variants={['no_shadow', 'no_round']}
        style={{
          padding: 0,
          borderTop: `none`,
          borderLeft: `none`,
          borderRight: `none`,
          borderBottom: `1px solid #5555CC55`,
          boxSizing: 'border-box'
        }}>
        <Button
          variants={['no_border', 'no_shadow', 'no_round']}
          onClick={onClose}
          disabled={loading}>
          ✕
        </Button>
        <Button
          variants={['no_border', 'no_shadow', 'no_round']}
          onClick={() => on_click_open_dir().catch(console.warn)}
          disabled={loading}>
          打开目录
        </Button>
      </Frame>
      <Frame
        variants={['no_border', 'no_shadow', 'no_round']}
        style={{ flex: 1, overflow: 'hidden', boxSizing: 'border-box' }}
        ref={ref_container} />
      {context}
    </Flex>
  );
}
