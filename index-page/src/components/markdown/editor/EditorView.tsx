import gfm from '@bytemd/plugin-gfm';
// import breaks from '@bytemd/plugin-breaks';
// import frontmatter from '@bytemd/plugin-frontmatter';
// import gemoji from '@bytemd/plugin-gemoji';
// import highlight from '@bytemd/plugin-highlight';
// import math from '@bytemd/plugin-math';
// import medium_zoom from '@bytemd/plugin-medium-zoom';
// import mermaid from '@bytemd/plugin-mermaid';
import { Editor, type EditorProps } from '@bytemd/react';
import 'bytemd/dist/index.css';
import { useState } from 'react';
import "./bytemd.scss"


const default_plugins = [
  gfm(),
  // breaks(),
  // frontmatter(),
  // gemoji(),
  // highlight(),
  // math(),
  // medium_zoom(),
  // mermaid(),
]
export interface IEditorViewProps extends Omit<EditorProps, 'value'> {
  value?: string;
}
export function EditorView(props: IEditorViewProps) {
  const { value = '', onChange, plugins = default_plugins, ..._p } = props
  const [_value, _setValue] = useState(value);
  const __value = onChange ? value : _value;
  const __setValue = onChange ? onChange : _setValue;
  return (
    <Editor
      value={__value}
      plugins={plugins}
      onChange={__setValue}
      {..._p}
    />
  )
}
EditorView.DefaultPlugins = default_plugins