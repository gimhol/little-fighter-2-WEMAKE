import { Checkbox } from "@/Component/Checkbox";
import { Form } from "@/Component/Form";
import { ISpaceProps, Space } from "@/Component/Space";
import { chase_info_new, frame_info_fields, frame_info_new, IFrameInfo, wpoint_info_new, bpoint_info_new, cpoint_info_new, bdy_info_new, IBdyInfo, itr_info_new, IItrInfo, opoint_info_new, IOpointInfo } from "@/LF2";
import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { FieldsRow } from "../FieldsRow";
import { BdyInfoForm } from "./BdyInfoForm";
import { BpointInfoForm } from "./BpointInfoForm";
import { ChaseInfoForm } from "./ChaseInfoForm";
import { CpointInfoForm } from "./CpointInfoForm";
import { ItrInfoForm } from "./ItrInfoForm";
import { OpointInfoForm } from "./OpointInfoForm";
import { WpointInfoForm } from "./WpointInfoForm";

type Data = IFrameInfo;
const data_new = frame_info_new;
const ALL_FIELDS = frame_info_fields;
const BASE_FIELD_KEYS: FieldKeysRow<Data>[] = [
  ['id', 'name'],
  ['state', 'wait'],
  ['centerx', 'centery'],
  ['width', 'height'],
  ['invisible', 'no_shadow', 'jump_flag'],
  ['behavior', 'facing', 'landable'],
  ['dvx', 'dvy', 'dvz'],
  ['vxm', 'vym', 'vzm'],
  ['acc_x', 'acc_y', 'acc_z'],
  ['ctrl_x', 'ctrl_y', 'ctrl_z'],
];

const arrayItemBoxStyle: CSSProperties = {
  position: 'relative',
  border: '1px solid #444',
  borderRadius: 4,
  padding: '8px 8px 4px',
  marginBottom: 4,
};
const arrayItemRemoveBtn: CSSProperties = {
  position: 'absolute',
  right: 4,
  top: 4,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 16,
  color: '#e44',
  padding: 0,
  lineHeight: 1,
};
const addBtn: CSSProperties = {
  border: '1px dashed #888',
  background: 'transparent',
  cursor: 'pointer',
  padding: '4px 12px',
  borderRadius: 4,
  color: '#aaa',
  fontSize: 13,
};

type ArrayItemChange<T> = (item: T, index: number) => void;
type ArrayItemRemove = (index: number) => void;
type ArrayItemAdd = () => void;

function makeArrayHandlers<T extends object>(
  i_value: Data,
  key: keyof Data,
  _new: () => T,
  onChange?: (value: Data) => void,
): { onItemChange: ArrayItemChange<T>; onItemRemove: ArrayItemRemove; onItemAdd: ArrayItemAdd } {
  const arr = (i_value[key] || []) as T[];
  return {
    onItemChange(item: T, index: number) {
      const next = [...arr];
      next[index] = item;
      onChange?.({ ...i_value, [key]: next.length ? next : undefined });
    },
    onItemRemove(index: number) {
      const next = [...arr];
      next.splice(index, 1);
      onChange?.({ ...i_value, [key]: next.length ? next : undefined });
    },
    onItemAdd() {
      const next = [...arr, _new()];
      onChange?.({ ...i_value, [key]: next });
    },
  };
}

export interface IFrameInfoFormProps extends ISpaceProps {
  value?: Data;
  onChange?(value: Data): void;
}

export function FrameInfoForm(props: IFrameInfoFormProps) {
  const { value: o_value, onChange, stretchs = true, direction = 'column', ..._p } = props;
  const i_value = useMemo<Data>(() => o_value ?? data_new(), [o_value]);
  const ref_o_value = useRef(o_value);
  const [form, _Form] = Form.useForm<Data>(i_value);

  useEffect(() => {
    if (o_value == ref_o_value.current) return;
    form.resetFieldsValue(i_value);
  }, [i_value, o_value, form]);

  return (
    <_Form form={form} onChange={(_, value) => onChange?.(value)}>
      <Space direction={direction} stretchs={stretchs} {..._p}>
        {BASE_FIELD_KEYS.map(v => <FieldsRow key={'' + v} row={v} fields={ALL_FIELDS} Form={_Form} />)}
        <Checkbox
          prefix='追踪'
          value={!!i_value.chase}
          onChange={v => {
            const o_value = { ...i_value };
            if (o_value.chase) delete o_value.chase;
            else o_value.chase = chase_info_new();
            onChange?.(o_value)
          }} />
        {
          !i_value.chase ? null :
            <_Form.Item name='chase' label=''>
              <ChaseInfoForm />
            </_Form.Item>
        }
        <Checkbox
          prefix='武器点'
          value={!!i_value.wpoint}
          onChange={v => {
            const o_value = { ...i_value };
            if (o_value.wpoint) delete o_value.wpoint;
            else o_value.wpoint = wpoint_info_new();
            onChange?.(o_value)
          }} />
        {
          !i_value.wpoint ? null :
            <_Form.Item name='wpoint' label=''>
              <WpointInfoForm />
            </_Form.Item>
        }
        <Checkbox
          prefix='流血点'
          value={!!i_value.bpoint}
          onChange={v => {
            const o_value = { ...i_value };
            if (o_value.bpoint) delete o_value.bpoint;
            else o_value.bpoint = bpoint_info_new();
            onChange?.(o_value)
          }} />
        {
          !i_value.bpoint ? null :
            <_Form.Item name='bpoint' label=''>
              <BpointInfoForm />
            </_Form.Item>
        }
        <Checkbox
          prefix='抓取点'
          value={!!i_value.cpoint}
          onChange={v => {
            const o_value = { ...i_value };
            if (o_value.cpoint) delete o_value.cpoint;
            else o_value.cpoint = cpoint_info_new();
            onChange?.(o_value)
          }} />
        {
          !i_value.cpoint ? null :
            <_Form.Item name='cpoint' label=''>
              <CpointInfoForm />
            </_Form.Item>
        }
        {/* --- 碰撞盒 (bdy) --- */}
        {i_value.bdy?.map((item, index) => {
          const { onItemChange, onItemRemove } = makeArrayHandlers<IBdyInfo>(i_value, 'bdy', bdy_info_new, onChange);
          return (
            <_Form.Item key={index} name={['bdy', index] as any} label={`碰撞盒 ${index + 1}`}>
              <div style={arrayItemBoxStyle}>
                <button style={arrayItemRemoveBtn} onClick={() => onItemRemove(index)}>✕</button>
                <BdyInfoForm value={item} onChange={v => onItemChange(v, index)} />
              </div>
            </_Form.Item>
          );
        })}
        <button style={addBtn} onClick={() => {
          const arr = [...(i_value.bdy || [])];
          arr.push(bdy_info_new());
          onChange?.({ ...i_value, bdy: arr });
        }}>+ 添加碰撞盒</button>
        {/* --- 攻击盒 (itr) --- */}
        {i_value.itr?.map((item, index) => {
          const { onItemChange, onItemRemove } = makeArrayHandlers<IItrInfo>(i_value, 'itr', itr_info_new, onChange);
          return (
            <_Form.Item key={index} name={['itr', index] as any} label={`攻击盒 ${index + 1}`}>
              <div style={arrayItemBoxStyle}>
                <button style={arrayItemRemoveBtn} onClick={() => onItemRemove(index)}>✕</button>
                <ItrInfoForm value={item} onChange={v => onItemChange(v, index)} />
              </div>
            </_Form.Item>
          );
        })}
        <button style={addBtn} onClick={() => {
          const arr = [...(i_value.itr || [])];
          arr.push(itr_info_new());
          onChange?.({ ...i_value, itr: arr });
        }}>+ 添加攻击盒</button>
        {/* --- 发射点 (opoint) --- */}
        {i_value.opoint?.map((item, index) => {
          const { onItemChange, onItemRemove } = makeArrayHandlers<IOpointInfo>(i_value, 'opoint', opoint_info_new, onChange);
          return (
            <_Form.Item key={index} name={['opoint', index] as any} label={`发射点 ${index + 1}`}>
              <div style={arrayItemBoxStyle}>
                <button style={arrayItemRemoveBtn} onClick={() => onItemRemove(index)}>✕</button>
                <OpointInfoForm value={item} onChange={v => onItemChange(v, index)} />
              </div>
            </_Form.Item>
          );
        })}
        <button style={addBtn} onClick={() => {
          const arr = [...(i_value.opoint || [])];
          arr.push(opoint_info_new());
          onChange?.({ ...i_value, opoint: arr });
        }}>+ 添加发射点</button>
      </Space>
    </_Form>
  );
}
