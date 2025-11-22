import { useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { Flex } from "../../Component/Flex";
import Frame, { IFrameProps } from "../../Component/Frame";
import { Input } from "../../Component/Input";
import Select from "../../Component/Select";
import Show from "../../Component/Show";
import { TextArea } from "../../Component/TextArea";
import Titled, { ITitledProps } from "../../Component/Titled";
import { Defines, HitFlag, IItrInfo, itr_effect_full_name, itr_kind_full_name, ItrEffect, ItrKind } from "@/LF2/defines";
import { floor } from "@/LF2/utils";
import { ITR_EFFECT_SELECT_PROPS, ITR_KIND_SELECT_PROPS } from "../EntityEditorView";
import { HitFlagEditor } from "./HitFlagEditor";
import { make_field_props, make_not_blank_field_props } from "./make_field_props";
import { QubeEdit } from "./QubeEdit";

export interface IItrEditorViewProps extends IFrameProps {
  label?: string;
  value?: IItrInfo;
  defaultValue?: IItrInfo
  onChange?(value?: IItrInfo): void;
  onRemove?(): void;
}
const titled_styles: ITitledProps['styles'] = {
  label: {
    width: 70,
    textAlign: 'end'
  }
}
const default_value: IItrInfo = {
  hit_flag: HitFlag.AllEnemy,
  kind: ItrKind.Normal,
  effect: ItrEffect.Normal,
  z: floor(-Defines.DAFUALT_QUBE_LENGTH / 2),
  l: floor(Defines.DAFUALT_QUBE_LENGTH),
  x: 0,
  y: 0,
  w: 0,
  h: 0
}
export function ItrEditor(props: IItrEditorViewProps) {
  const { label = 'itr info', value, defaultValue = default_value, onRemove, onChange, ..._p } = props;
  const kind = value?.kind ?? defaultValue.kind;
  const is_vrest = !!value && 'vrest' in value;
  return (
    <Frame key={label} label={label} tabIndex={-1} {..._p}>
      <Button style={{ position: 'absolute', right: 0, top: 0, border: 'none' }} onClick={onRemove}>
        🗑️
      </Button>
      <Flex direction='column' align='stretch' gap={5}>
        <Titled label='类型' styles={titled_styles}>
          <Combine>
            <Select
              {...ITR_KIND_SELECT_PROPS}
              {...make_field_props(props, default_value, 'kind', (v) => {
                v.kind_name = itr_kind_full_name(v.kind);
                if (v.kind !== ItrKind.Normal) {
                  delete v.effect;
                  delete v.effect_name;
                }
                return v;
              })}
              data-flex={1}
            />
            <Show show={kind === ItrKind.Normal} data-flex={1}>
              <Select
                {...ITR_EFFECT_SELECT_PROPS}
                {...make_field_props(props, default_value, 'effect', (v) => {
                  v.effect_name = itr_effect_full_name(v.effect)
                  return v;
                })}
              />
            </Show>
          </Combine>
        </Titled>
        <Titled label='判定' styles={titled_styles}>
          <HitFlagEditor {...make_field_props(props, default_value, 'hit_flag')} />
        </Titled>
        <Flex direction='row'>
          <Titled label='自身停顿' styles={titled_styles} style={{ flex: 1 }}>
            <Input.Number
              {...make_not_blank_field_props(props, default_value, 'motionless')}
              clearable
              placeholder={'' + Defines.DEFAULT_ITR_MOTIONLESS}
              step={1} />
          </Titled>
          <Titled label='目标停顿' style={{ flex: 1 }}>
            <Input.Number
              {...make_not_blank_field_props(props, default_value, 'shaking')}
              clearable
              placeholder={'' + Defines.DEFAULT_ITR_SHAKING}
              step={1} />
          </Titled>
        </Flex>
        <Titled label='rest' styles={titled_styles}>
          <Combine>
            <Select
              items={['arest', 'vrest'] as const}
              parse={v => [v, v]}
              value={is_vrest ? 'vrest' : 'arest'}
              onChange={(v: 'arest' | 'vrest' | undefined) => {
                const next = { ...(value || defaultValue) };
                const rest = next.arest || next.vrest || 0;
                delete next.arest;
                delete next.vrest;
                next[v!] = rest
                onChange?.(next)
              }} />
            <Input.Number
              data-flex={1}
              {...make_not_blank_field_props(props, default_value, is_vrest ? 'vrest' : 'arest')}
              placeholder={'' + Defines.DEFAULT_ITR_MOTIONLESS}
              clearable
              step={1} />
          </Combine>
        </Titled>
        <Flex direction='row'>
          <Titled label='击倒值' styles={titled_styles} style={{ flex: 1 }}>
            <Input.Number {...make_not_blank_field_props(props, default_value, 'fall')} placeholder={'' + Defines.DEFAULT_ITR_FALL} clearable step={1} />
          </Titled>
          <Titled label='破防值' style={{ flex: 1 }}>
            <Input.Number {...make_not_blank_field_props(props, default_value, 'bdefend')} clearable step={1} />
          </Titled>
          <Titled label='伤害值' style={{ flex: 1 }}>
            <Input.Number {...make_not_blank_field_props(props, default_value, 'injury')} clearable step={1} />
          </Titled>
        </Flex>
        <Titled label='包围盒' styles={titled_styles}>
          <QubeEdit
            value={value}
            defaultValue={defaultValue}
            onChange={v => onChange?.({ ...defaultValue, ...value, ...v })} />
        </Titled>
        <Titled label='条件' styles={titled_styles}>
          <TextArea {...make_not_blank_field_props(props, default_value, 'test')} style={{ resize: 'vertical' }} />
        </Titled>
        <Titled label='预设' styles={titled_styles}>
          <Input {...make_not_blank_field_props(props, default_value, 'prefab_id')} clearable />
        </Titled>
      </Flex>
    </Frame>
  )
}
ItrEditor.genValue = (fn?: (edit: IItrInfo) => IItrInfo) => fn ? fn({ ...default_value }) : { ...default_value }
export default function ItrEditorTestView(props: {}) {
  const [value, set_value] = useState<IItrInfo | undefined>(default_value)
  return (
    <Flex direction='column' gap={10}>
      <TextArea style={{ resize: 'vertical', height: 500 }} readOnly value={JSON.stringify(value, null, 2)} />
      <ItrEditor value={value} onChange={set_value} />
    </Flex>
  )
};