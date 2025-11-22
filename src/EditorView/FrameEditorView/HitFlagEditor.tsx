import { Checkbox } from "../../Component/Checkbox";
import { Flex } from "../../Component/Flex";
import { HitFlag } from "@/LF2/defines";
import { IFieldProps } from "./make_field_props";
export interface IHitFlagEditorProps extends IFieldProps<number> {

}
export function HitFlagEditor(props: IHitFlagEditorProps) {
  const { defaultValue = 0, value = defaultValue, onChange } = props
  return (
    <Flex direction='row' gap={5}>
      <Checkbox prefix='敌人' value={(value & HitFlag.Enemy) !== 0}
        onChange={checked => onChange?.(checked ? (value | HitFlag.Enemy) : (value ^ HitFlag.Enemy))} />
      <Checkbox prefix='队友' value={(value & HitFlag.Ally) !== 0}
        onChange={checked => onChange?.(checked ? (value | HitFlag.Ally) : (value ^ HitFlag.Ally))} />
      <Checkbox prefix='角色' value={(value & HitFlag.Fighter) !== 0}
        onChange={checked => onChange?.(checked ? (value | HitFlag.Fighter) : (value ^ HitFlag.Fighter))} />
      <Checkbox prefix='武器' value={(value & HitFlag.Weapon) !== 0}
        onChange={checked => onChange?.(checked ? (value | HitFlag.Weapon) : (value ^ HitFlag.Weapon))} />
      <Checkbox prefix='气功' value={(value & HitFlag.Ball) !== 0}
        onChange={checked => onChange?.(checked ? (value | HitFlag.Ball) : (value ^ HitFlag.Ball))} />
      <Checkbox prefix='其他' value={(value & HitFlag.Ohters) !== 0}
        onChange={checked => onChange?.(checked ? (value | HitFlag.Ohters) : (value ^ HitFlag.Ohters))} />
    </Flex>
  );
}
