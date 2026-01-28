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
import * as aa from "./Players";
import * as ab from "./PlayerScore";
import * as ac from "./PlayerScoreCell";
import * as ad from "./PlayerScorePlayerName";
import * as ae from "./PlayerTeamName";
import * as af from "./PlayingTimeText";
import * as ag from "./PositionAnimation";
import * as ah from "./PrefixAndDifficultyText";
import * as ai from "./RandomImg";
import * as aj from "./RandomTxt";
import * as ak from "./Reachable";
import * as al from "./ReachableGroup";
import * as am from "./ScaleAnimation";
import * as an from "./ScaleClickable";
import * as ao from "./SineOpacity";
import * as ap from "./Sounds";
import * as aq from "./StageModeLogic";
import * as ar from "./StageNameText";
import * as as from "./StageTitleShow";
import * as at from "./StageTitleText";
import * as au from "./StageTransitions";
import * as av from "./SummaryLogic";
import * as aw from "./TeamSituationText";
import * as ax from "./TextInput";
import * as ay from "./TxtClickable";
import * as az from "./VerticalLayout";
import * as b0 from "./VsModeLogic";
import * as b1 from "./HideWhenDialoging"
import * as b2 from "./LittleFunnyAutoGame"
/*** COMPONENTS IMPORT END ***/

export const ALL_COMPONENTS = [
  /*** COMPONENTS MAP START ***/
  a.Alignment, b.BackgroundNameText, c.CameraCtrl, e.CharMenuHead,
  h.DemoModeLogic, j.DifficultyText, k.EndingPageLogic, l.FadeInOpacity, m.FadeOutOpacity,
  n.FighterHead, o.FighterName, q.FighterThumb, r.FitChildren, s.Flex, t.FlexItem,
  u.GamePrepareLogic, v.HorizontalLayout, w.ImgClickable, x.ImgLoop, a0.LaunchPage,
  a1.LoadingContentText, a3.OpacityFlash, a2.OpacityAnimation, a4.OpacityHover, a5.PlayerCtrlType,
  a7.PlayerKeyText, a8.PlayerName, aa.Players, ab.PlayerScore, ac.PlayerScoreCell,
  ae.PlayerTeamName, af.PlayingTimeText, ag.PositionAnimation, ah.PrefixAndDifficultyText,
  ai.RandomImg, aj.RandomTxt, ak.Reachable, al.ReachableGroup, am.ScaleAnimation,
  an.ScaleClickable, ao.SineOpacity, ap.Sounds, aq.StageModeLogic,
  ar.StageNameText, as.StageTitleShow, at.StageTitleText, au.StageTransitions,
  av.SummaryLogic, aw.TeamSituationText, ax.TextInput, ay.TxtClickable, az.VerticalLayout,
  b0.VsModeLogic, z.Jalousie, a6.PlayerKeyEdit, g.DanmuGameLogic, a9.PlayerNameInput, p.FighterStatBar,
  f.ComponentsPlayer, d.CharMenuLogic, y.IntegerPicker, ad.PlayerScorePlayerName,
  i.Dialogs, b1.HideWhenDialoging, b2.LittleFunnyAutoGame
  /*** COMPONENTS MAP END ***/
].map(v => [v.TAG, v] as const);
