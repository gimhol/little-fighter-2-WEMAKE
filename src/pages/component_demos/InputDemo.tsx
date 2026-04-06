import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { Input } from "../../Component/Input";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";
import { Variant } from "../../Component/StyleBase/Variant";
import Select from "../../Component/Select";

export default function InputDemo() {
  const [clearable, set_clearable] = useState(false);
  const [prefix, set_prefix] = useState('prefix:');
  const [placeholder, set_placeholder] = useState('placeholder');
  const [suffix, set_suffix] = useState('suffix');
  const [variants, set_variants] = useState<Variant[] | undefined>();

  return (
    <Frame label='Input'>
      <Space direction='column'>
        <Input prefix={prefix} placeholder={placeholder} suffix={suffix} clearable={clearable} variants={variants}/>
        <Titled label="variants">
          <Select
            multi
            value={variants}
            options={Object.values(Variant)}
            parse={i => [i, '' + i]}
            onChange={set_variants} />
        </Titled>
        <Titled label="clearable">
          <Checkbox value={clearable} onChange={set_clearable} />
        </Titled>
        <Titled label="prefix">
          <Input value={prefix} onChange={e => set_prefix(e)} />
        </Titled>
        <Titled label="placeholder">
          <Input value={placeholder} onChange={e => set_placeholder(e)} />
        </Titled>
        <Titled label="suffix">
          <Input value={suffix} onChange={e => set_suffix(e)} />
        </Titled>
      </Space>
    </Frame>
  )
}
