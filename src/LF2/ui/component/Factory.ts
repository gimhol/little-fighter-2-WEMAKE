import { Ditto } from "../../ditto";
import { is_str } from "../../utils/type_check";
import { IUIInfo } from "../IUIInfo.dat";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";
import { Alignment } from "./Alignment";
import BackgroundNameText from "./BackgroundNameText";
import { CameraCtrl } from "./CameraCtrl";
import ComNumButton from "./ComNumButton";
import { DanmuGameLogic } from "./DanmuGameLogic";
import { DemoModeLogic } from "./DemoModeLogic";
import DifficultyText from "./DifficultyText";
import { EndingPageLogic } from "./EndingPageLogic";
import { FadeInOpacity } from "./FadeInOpacity";
import { FadeOutOpacity } from "./FadeOutOpacity";
import FighterHead from "./FighterHead";
import FighterName from "./FighterName";
import FighterThumb from "./FighterThumb";
import { FitChildren } from "./FitChildren";
import { Flex } from "./Flex";
import { FlexItem } from "./FlexItem";
import GamePrepareLogic from "./GamePrepareLogic";
import { HorizontalLayout } from "./HorizontalLayout";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { ImgClickable } from "./ImgClickable";
import { ImgLoop } from "./ImgLoop";
import { Jalousie } from "./Jalousie";
import { LaunchPage } from "./LaunchPageLogic";
import { LoadingContentText } from "./LoadingContentText";
import { OpacityAnimation } from "./OpacityAnimation";
import { OpacityHover } from "./OpacityHover";
import { PlayerCtrlType } from "./PlayerCtrlType";
import { PlayerKeyEdit } from "./PlayerKeyEdit";
import { PlayerKeyText } from "./PlayerKeyText";
import PlayerName from "./PlayerName";
import { PlayerNameInput } from "./PlayerNameInput";
import PlayerScore from "./PlayerScore";
import PlayerScoreCell from "./PlayerScoreCell";
import PlayerTeamName from "./PlayerTeamName";
import { PlayingTimeText } from "./PlayingTimeText";
import { PositionAnimation } from "./PositionAnimation";
import { PrefixAndDifficultyText } from "./PrefixAndDifficultyText";
import { RandomImg } from "./RandomImg";
import { RandomTxt } from "./RandomTxt";
import { Reachable } from "./Reachable";
import { ReachableGroup } from "./ReachableGroup";
import { ScaleAnimation } from "./ScaleAnimation";
import { ScaleClickable } from "./ScaleClickable";
import { SineOpacity } from "./SineOpacity";
import SlotSelLogic from "./SlotSelLogic";
import { Sounds } from "./Sounds";
import { StageModeLogic } from "./StageModeLogic";
import StageNameText from "./StageNameText";
import { StageTitleShow } from "./StageTitleShow";
import { StageTitleText } from "./StageTitleText";
import StageTransitions from "./StageTransitions";
import { SummaryLogic } from "./SummaryLogic";
import { TeamSituationText } from "./TeamSituationText";
import { TextInput } from "./TextInput";
import { TxtClickable } from "./TxtClickable";
import { UIComponent } from "./UIComponent";
import { VerticalLayout } from "./VerticalLayout";
import { VsModeLogic } from "./VsModeLogic";
const COMPONENTS = [
  LaunchPage,
  LoadingContentText,
  PlayerKeyEdit,
  PlayerKeyText,
  StageTransitions,
  SlotSelLogic,
  FighterHead,
  FighterThumb,
  FighterName,
  PlayerName,
  PlayerTeamName,
  GamePrepareLogic,
  ComNumButton,
  StageTitleShow,
  ReachableGroup,
  Reachable,
  DifficultyText,
  StageNameText,
  StageTitleText,
  BackgroundNameText,
  OpacityHover,
  ScaleClickable,
  VerticalLayout,
  HorizontalLayout,
  PlayerScore,
  PlayerScoreCell,
  VsModeLogic,
  StageModeLogic,
  DemoModeLogic,
  PlayingTimeText,
  RandomImg,
  RandomTxt,
  Jalousie,
  SineOpacity,
  FadeInOpacity,
  FadeOutOpacity,
  OpacityAnimation,
  ScaleAnimation,
  PositionAnimation,
  Sounds,
  ImgLoop,
  PlayerCtrlType,
  Alignment,
  Flex,
  FlexItem,
  FitChildren,
  DanmuGameLogic,
  CameraCtrl,
  SummaryLogic,
  EndingPageLogic,
  PrefixAndDifficultyText,
  TeamSituationText,
  TextInput,
  PlayerNameInput,
  ImgClickable,
  TxtClickable,
].map(v => [v.TAG, v] as const)

class ComponentFactory {
  static readonly TAG = `ComponentFactory`;
  private _component_map = new Map<string, typeof UIComponent<IUICompnentCallbacks>>(COMPONENTS);

  register(key: string, Cls: typeof UIComponent) {
    if (this._component_map.has(key))
      Ditto.warn(`[${ComponentFactory.TAG}::register] key already exists, ${key}`)
    this._component_map.set(key, Cls);
  }

  create(layout: UINode, components: IUIInfo["component"]): UIComponent[] {
    if (!components) return [];
    if (!Array.isArray(components)) components = [components]
    if (!components.length) return [];

    const ret: UIComponent[] = [];
    for (let idx = 0; idx < components.length; idx++) {
      const raw = components[idx];
      const info = is_str(raw) ? parse_call_func_expression(raw) : raw
      if (!info) {
        Ditto.warn(`[${ComponentFactory.TAG}::create] expression not correct! expression: ${raw}`);
        continue;
      }
      const cls = this._component_map.get(info.name);
      if (!cls) {
        Ditto.warn(`[${ComponentFactory.TAG}::create] Component not found! expression: ${raw}`);
        continue;
      }
      const { name, args = [], enabled = true, id = '', properties = {} } = info;
      const component = new cls(layout, name, { name, args, enabled, id, properties })
      component.init(...args)
      component.set_enabled(enabled);
      component.id = id || `${name}_${idx}`
      ret.push(component);
    }
    return ret;
  }

}
const factory = new ComponentFactory();
export default factory;
