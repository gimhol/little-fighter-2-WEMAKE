/*** COMPONENTS IMPORT START ***/
import * as a from "./Alignment";
import * as b from "./BackgroundNameText";
import * as c from "./CameraCtrl";
import * as d from "./CharMenu/CharMenuLogic";
import * as e from "./CharMenuHead";
import * as f from "./ComponentsPlayer";
import * as g from "./DanmuGameLogic";
import * as h from "./DemoModeLogic";
import * as i from "./Dialogs";
import * as j from "./DifficultyText";
import * as k from "./EndingPageLogic";
import * as l from "./FadeInOpacity";
import * as m from "./FadeOutOpacity";
import * as n from "./FighterHead";
import * as o from "./FighterName";
import * as p from "./FighterStatBar";
import * as q from "./FighterThumb";
import * as r from "./FitChildren";
import * as s from "./Flex";
import * as t from "./FlexItem";
import * as u from "./GamePrepareLogic";
import * as v from "./HorizontalLayout";
import * as w from "./ImgClickable";
import * as x from "./ImgLoop";
import * as y from "./IntegerPicker";
import * as z from "./Jalousie";
import * as a0 from "./LaunchPageLogic";
import * as a1 from "./LoadingContentText";
import * as a2 from "./OpacityAnimation";
import * as a3 from "./OpacityFlash";
import * as a4 from "./OpacityHover";
import * as a5 from "./PlayerCtrlType";
import * as a6 from "./PlayerKeyEdit";
import * as a7 from "./PlayerKeyText";
import * as a8 from "./PlayerName";
import * as a9 from "./PlayerNameInput";
import * as b0 from "./Players";
import * as b1 from "./PlayerScore";
import * as b2 from "./PlayerScoreCell";
import * as b3 from "./PlayerScorePlayerName";
import * as b4 from "./PlayerTeamName";
import * as b5 from "./PlayingTimeText";
import * as b6 from "./PositionAnimation";
import * as b7 from "./PrefixAndDifficultyText";
import * as b8 from "./RandomImg";
import * as b9 from "./RandomTxt";
import * as c0 from "./Reachable";
import * as c1 from "./ReachableGroup";
import * as c2 from "./ScaleAnimation";
import * as c3 from "./ScaleClickable";
import * as c4 from "./SineOpacity";
import * as c5 from "./Sounds";
import * as c6 from "./StageModeLogic";
import * as c7 from "./StageNameText";
import * as c8 from "./StageTitleShow";
import * as c9 from "./StageTitleText";
import * as d0 from "./StageTransitions";
import * as d1 from "./SummaryLogic";
import * as d2 from "./TeamSituationText";
import * as d3 from "./TextInput";
import * as d4 from "./TxtClickable";
import * as d5 from "./VerticalLayout";
import * as d6 from "./VsModeLogic";
/*** COMPONENTS IMPORT END ***/

export const ALL_COMPONENTS = [
  /*** COMPONENTS MAP START ***/
  a.Alignment, b.BackgroundNameText, c.CameraCtrl, e.CharMenuHead,
  h.DemoModeLogic, j.DifficultyText, k.EndingPageLogic, l.FadeInOpacity, m.FadeOutOpacity,
  n.FighterHead, o.FighterName, q.FighterThumb, r.FitChildren, s.Flex, t.FlexItem,
  u.GamePrepareLogic, v.HorizontalLayout, w.ImgClickable, x.ImgLoop, a0.LaunchPage,
  a1.LoadingContentText, a3.OpacityFlash, a2.OpacityAnimation, a4.OpacityHover, a5.PlayerCtrlType,
  a7.PlayerKeyText, a8.PlayerName, b0.Players, b1.PlayerScore, b2.PlayerScoreCell,
  b4.PlayerTeamName, b5.PlayingTimeText, b6.PositionAnimation, b7.PrefixAndDifficultyText,
  b8.RandomImg, b9.RandomTxt, c0.Reachable, c1.ReachableGroup, c2.ScaleAnimation,
  c3.ScaleClickable, c4.SineOpacity, c5.Sounds, c6.StageModeLogic,
  c7.StageNameText, c8.StageTitleShow, c9.StageTitleText, d0.StageTransitions,
  d1.SummaryLogic, d2.TeamSituationText, d3.TextInput, d4.TxtClickable, d5.VerticalLayout,
  d6.VsModeLogic, z.Jalousie, a6.PlayerKeyEdit, g.DanmuGameLogic, a9.PlayerNameInput, p.FighterStatBar,
  f.ComponentsPlayer, d.CharMenuLogic, y.IntegerPicker, b3.PlayerScorePlayerName, i.Dialogs
  /*** COMPONENTS MAP END ***/
].map(v => [v.TAG, v] as const);
