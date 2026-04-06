import { Defines } from "../LF2/defines/defines";
import Select, { ISelectProps } from "./Select";
export interface TeamSelectProps extends Omit<ISelectProps<Defines.TeamEnum, string>, 'parse'> { }
export default function TeamSelect(props: TeamSelectProps) {
  return (
    <Select
      {...props}
      options={Defines.Teams}
      parse={(i) => [i, Defines.TeamInfoMap[i].i18n]}
    />
  );
}
