import { Defines } from "../LFW/defines/defines";
import Select, { type ISelectProps } from "./Select";
export interface TeamSelectProps extends Omit<ISelectProps<Defines.TeamEnum, string>, 'parse'> { }
export default function TeamSelect(props: TeamSelectProps) {
  return (
    <Select
      {...props}
      options={Defines.Teams}
      parse={(i) => [i, Defines.TeamInfoMap[i]!.i18n]}
    />
  );
}
