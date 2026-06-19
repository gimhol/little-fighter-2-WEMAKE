import { useState } from "react";
import { Checkbox } from "../../Component/Checkbox";
import Frame from "../../Component/Frame";
import { ArrowDown } from "../../Component/Icons/ArrowDown";
import { ArrowLeft } from "../../Component/Icons/ArrowLeft";
import { ArrowRight } from "../../Component/Icons/ArrowRight";
import { ArrowUp } from "../../Component/Icons/ArrowUp";
import type { IIconProps } from "../../Component/Icons/Base";
import { CircleCross } from '../../Component/Icons/CircleCross';
import { Cross } from '../../Component/Icons/Cross';
import { DropdownArrow } from '../../Component/Icons/DropdownArrow';
import { Plus } from '../../Component/Icons/Plus';
import { Search } from "../../Component/Icons/Search";
import { Tick } from '../../Component/Icons/Tick';
import { InputNumber } from "../../Component/Input";
import { Space } from "../../Component/Space";
import Titled from "../../Component/Titled";

export default function IconDemo() {
  const [hoverable, set_hoverable] = useState(false);
  const [font_size, set_font_size] = useState<number | undefined>(16)
  const c: IIconProps = { hoverable }
  return (
    <Frame label='Icon'>
      <Space>
        <Titled label='hoverable'>
          <Checkbox value={hoverable} onChange={set_hoverable} />
        </Titled>
        <Titled float_label='font size'>
          <InputNumber
            step={1}
            min={1}
            max={70}
            value={font_size}
            onChange={set_font_size}
            placeholder="font size" />
        </Titled>
      </Space>

      <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: font_size, flexWrap: 'wrap' }}>
        HELLO 你好
        <CircleCross {...c} />
        <DropdownArrow {...c} />
        <ArrowUp {...c} />
        <ArrowDown {...c} />
        <ArrowLeft {...c} />
        <ArrowRight {...c} />
        <Search {...c} />
        <Plus {...c} />
        <Cross {...c} />
        <Tick {...c} />
      </div>
    </Frame>
  );
}
