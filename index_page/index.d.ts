
declare interface IInfo {
  id?: string;
  date?: string;
  title?: string;
  desc?: string | string[];
  url?: string | string[];
  changelog?: string | string[];
  i18n: { [x in string]: IGameInfo };
}