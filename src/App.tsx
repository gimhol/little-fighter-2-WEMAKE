import { useShortcut } from "@fimagine/dom-hooks";
import classNames from "classnames";
import qs from "qs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router";
import { DomAdapter } from "splittings-dom/dist/es/splittings-dom";
import "splittings-dom/dist/es/splittings-dom.css";
import { Workspaces } from "splittings/dist/es/splittings";
import styles from "./App.module.scss";
import { Button } from "./Component/Buttons/Button";
import { StatusButton } from "./Component/Buttons/StatusButton";
import { ToggleButton } from "./Component/Buttons/ToggleButton";
import { ToggleImgButton } from "./Component/Buttons/ToggleImgButton";
import Combine from "./Component/Combine";
import { InputNumber } from "./Component/Input";
import Select from "./Component/Select";
import Show from "./Component/Show";
import Titled from "./Component/Titled";
import { DanmuOverlay } from "./DanmuOverlay";
import { __Pointings } from "./DittoImpl";
import { Indicating, INDICATINGS } from "./DittoImpl/renderer/FrameIndicators";
import { WorldRenderer } from "./DittoImpl/renderer/WorldRenderer";
import EditorView from "./EditorView";
import { GameOverlay } from "./GameOverlay";
import GamePad from "./GamePad";
import { LF2 } from "./LF2/LF2";
import Invoker from "./LF2/base/Invoker";
import { CheatType } from "./LF2/defines";
import { Defines } from "./LF2/defines/defines";
import { Ditto } from "./LF2/ditto";
import { is_weapon } from "./LF2/entity/type_check";
import { IUIInfo } from "./LF2/ui/IUIInfo.dat";
import { fisrt } from "./LF2/utils/container_help";
import { arithmetic_progression } from "./LF2/utils/math/arithmetic_progression";
import { Loading } from "./LoadingImg";
import { Log } from "./Log";
import { PlayerRow } from "./PlayerRow";
import SettingsRows from "./SettingsRows";
import { open_file } from "./Utils/open_file";
import img_btn_0_3 from "./assets/btn_0_3.png";
import img_btn_1_0 from "./assets/btn_1_0.png";
import img_btn_1_1 from "./assets/btn_1_1.png";
import img_btn_1_2 from "./assets/btn_1_2.png";
import img_btn_1_3 from "./assets/btn_1_3.png";
import img_btn_2_0 from "./assets/btn_2_0.png";
import img_btn_2_1 from "./assets/btn_2_1.png";
import img_btn_2_2 from "./assets/btn_2_2.png";
import img_btn_2_3 from "./assets/btn_2_3.png";
import img_btn_3_0 from "./assets/btn_3_0.png";
import img_btn_3_1 from "./assets/btn_3_1.png";
import img_btn_3_2 from "./assets/btn_3_2.png";
import "./init";
import { DatViewer } from "./pages/dat_viewer/DatViewer";
import { useWorkspaces } from "./pages/dat_viewer/useWorkspaces";
import { Networking } from "./pages/network_test/Networking";
import {
  useLocalBoolean,
  useLocalNumber,
  useLocalString,
} from "./useLocalStorage";

function App() {
  const [fullscreen] = useState(() => new Ditto.FullScreen());
  const ref_lf2 = useRef<LF2 | undefined>(void 0)
  const [lf2, set_lf2] = useState<LF2 | undefined>()
  const [ele_game_canvas, set_ele_game_canvas] = useState<HTMLCanvasElement | null>(null)
  const [ele_game_overlay, set_ele_game_overlay] = useState<HTMLElement | null>(null)
  const [ele_root, set_ele_root] = useState<HTMLDivElement | null>(null)
  const [[workspace, , game_cell, pannel_cell], set_workspace] = useState<
    [Workspaces | null, DomAdapter | null, HTMLElement | null, HTMLElement | null]
  >([null, null, null, null])

  const [dat_viewer_open, set_dat_viewer_open] = useState(false);
  const [editor_open, set_editor_open] = useState(false);
  const [game_overlay, set_game_overlay] = useLocalBoolean(
    "game_overlay",
    false,
  );
  const [showing_panel, set_showing_panel] = useLocalString<
    "world_tuning" | "stage" | "bg" | "weapon" | "bot" | "player" | ""
  >("showing_panel", "");
  const [control_panel_visible, set_control_panel_visible] = useLocalBoolean(
    "control_panel",
    false,
  );
  const [cheat_1, _set_cheat_1] = useLocalBoolean("cheat_1", false);
  const [cheat_2, _set_cheat_2] = useLocalBoolean("cheat_2", false);
  const [cheat_3, _set_cheat_3] = useLocalBoolean("cheat_3", false);
  const [loading, set_loading] = useState(false);
  const [loaded, set_loaded] = useState(false);
  const [paused, _set_paused] = useState(false);
  const [bg_id, _set_bg_id] = useState(Defines.VOID_BG.id);
  const [muted, _set_muted] = useLocalBoolean("total_muted", false);
  const [bgm_muted, _set_bgm_muted] = useLocalBoolean("bgm_muted", false);
  const [sound_muted, _set_sound_muted] = useLocalBoolean("sound_muted", false);
  const [volume, _set_volume] = useLocalNumber<number>("total_volume", 0.3);
  const [bgm_volume, _set_bgm_volume] = useLocalNumber<number>("bgm_volume", 0.5);
  const [sound_volume, _set_sound_volume] = useLocalNumber<number>("sound_volume", 1,);
  const [render_size_mode, set_render_size_mode] = useLocalString<
    "fixed" | "fill" | "cover" | "contain"
  >("render_size_mode", "contain");
  const [render_fixed_scale, set_render_fixed_scale] = useLocalNumber<number>(
    "render_fixed_scale",
    1,
  );
  const [custom_render_fixed_scale, set_custom_render_fixed_scale] =
    useLocalNumber<number>("custom_render_fixed_scale", 1);
  const [v_align, set_v_align] = useLocalNumber<number>(
    "v_align",
    document.body.parentElement!.className.indexOf("portrait") >= 0 ? 0.3 : 0.5,
  );
  const [h_align, set_h_align] = useLocalNumber<number>("h_align", 0.5);
  const [custom_h_align, set_custom_h_align] = useLocalNumber<number>(
    "custom_h_align",
    0.5,
  );
  const [custom_v_align, set_custom_v_align] = useLocalNumber<number>(
    "custom_v_align",
    0.5,
  );
  const [debug_ui_pos, set_debug_ui_pos] = useLocalString<
    "left" | "right" | "top" | "bottom"
  >("debug_ui_pos", "bottom");
  const [touch_pad_on, set_touch_pad_on] = useLocalString<string>(
    "touch_pad_on",
    "",
  );
  const [is_fullscreen, _set_is_fullscreen] = useState(false);
  const [sync_render, set_sync_render] = useLocalNumber<0 | 1 | 2>(
    "sync_render",
    0,
  );
  const [indicator_flags, set_indicator_flags] = useState<number>(0);

  const update_once = () => {
    lf2?.world.set_paused(true);
    lf2?.world.update_once();
  };

  useEffect(() => {
    if (!lf2) return;
    lf2.world.indicator_flags = indicator_flags;
  }, [indicator_flags]);

  const [fast_forward, set_fast_forward] = useState(false);
  useEffect(() => {
    if (!lf2) return;
    lf2.world.playrate = fast_forward ? 100 : 1;
  }, [fast_forward]);

  const toggle_fullscreen = useCallback(() => {
    if (fullscreen.is_fullscreen) fullscreen.exit();
    else fullscreen.enter(document.body.parentElement!);
  }, [fullscreen]);

  const [ui_id, _set_ui] = useState<string | undefined>(void 0);
  const [uis, set_uis] = useState<Readonly<IUIInfo>[]>([
    { id: "", name: "无页面" },
  ]);

  useEffect(() => {
    if (!lf2 || !ele_game_overlay) return;
    const ele = new GameOverlay(lf2.world, ele_game_overlay);
    return () => ele.release()

  }, [lf2, ele_game_overlay])

  const l = useLocation()
  const { sobj, hobj } = useMemo(() => {
    const sobj = qs.parse(l.search.substring(1))
    const hobj = qs.parse(l.hash.substring(1))
    return { sobj, hobj }
  }, [l])

  useEffect(() => {
    let lang = sobj.lang || hobj.lang;
    let dev = sobj.dev || hobj.dev
    if (typeof lang !== 'string') lang = navigator.language.toLowerCase()
    const lf2 = ref_lf2.current = new LF2(dev == '1');
    lf2.lang = lang;

    (window as any).LF2 = LF2;

    function print_ui_tree(node = LF2.ui) {
      console.group('id: ' + node?.id + ', name: ' + node?.name);
      console.log("node:      ", node);
      if (node?.components.size)
        console.log("components:", Array.from(node?.components));
      if (node?.children.length)
        for (const child of node?.children)
          print_ui_tree(child)
      console.groupEnd();
    };

    Object.defineProperty(window, 'ui_tree', {
      get() { print_ui_tree() },
      configurable: true
    })

    lf2.load("prel.zip.json").catch(LF2.IgnoreDisposed);
    set_lf2(lf2)
    lf2.sounds.set_muted(muted);
    lf2.sounds.set_volume(volume);
    lf2.sounds.set_bgm_muted(bgm_muted);
    lf2.sounds.set_bgm_volume(bgm_volume);
    lf2.sounds.set_sound_muted(sound_muted);
    lf2.sounds.set_sound_volume(sound_volume);
    lf2.world.sync_render = sync_render;
    _set_cheat_1(lf2.is_cheat_enabled(CheatType.LF2_NET));
    _set_cheat_2(lf2.is_cheat_enabled(CheatType.HERO_FT));
    _set_cheat_3(lf2.is_cheat_enabled(CheatType.GIM_INK));
    _set_bg_id(lf2.world.stage.bg.id);
    const on_touchstart = () => {
      set_touch_pad_on(fisrt(lf2.players.keys())!);
    };
    const on_keydown = () => {
      set_touch_pad_on("");
    };
    window.addEventListener("touchstart", on_touchstart, { once: true });
    window.addEventListener("keydown", on_keydown);
    _set_is_fullscreen(!!fullscreen.target);
    _set_paused(lf2.world.paused);
    const invoker = new Invoker()
      .add(
        () => window.removeEventListener("keydown", on_keydown),
        () => window.removeEventListener("touchstart", on_touchstart),
        fullscreen.callbacks.add({
          onChange: (e) => _set_is_fullscreen(!!e),
        }),
        lf2.world.callbacks.add({
          on_stage_change: (s) => _set_bg_id(s.bg.id),
          on_pause_change: (v) => _set_paused(v),
          on_dataset_change: (key, value) => {
            if (key === 'sync_render') set_sync_render(value as any)
          },
        }),
        lf2.callbacks.add({
          on_ui_loaded: (ui) => {
            const layout_data_list = ui.map((l) => ({
              id: l.id,
              name: l.name,
            }));
            layout_data_list.unshift({ id: "", name: "无页面" });
            set_uis(layout_data_list);

            if (layout_data_list.length > 1)
              _set_ui((v) => v || layout_data_list[1].id);
          },
          on_ui_changed: (v) => _set_ui(v?.id ?? ""),
          on_loading_start: () => set_loading(true),
          on_loading_end: () => {
            set_loaded(true);
            set_loading(false);
          },
          on_cheat_changed: (cheat_name, enabled) => {
            switch (cheat_name) {
              case CheatType.LF2_NET:
                _set_cheat_1(enabled);
                break;
              case CheatType.HERO_FT:
                _set_cheat_2(enabled);
                break;
              case CheatType.GIM_INK:
                _set_cheat_3(enabled);
                set_control_panel_visible(enabled)
                set_game_overlay(enabled)
                break;
            }
          },
          on_prel_loaded: () => {
            const { test_ui } = qs.parse(window.location.search.substring(1))
            if (typeof test_ui === 'string') lf2.set_ui(test_ui)
          },
        }),
        lf2.sounds.callbacks.add({
          on_muted_changed: _set_muted,
          on_bgm_muted_changed: _set_bgm_muted,
          on_sound_muted_changed: _set_sound_muted,
          on_volume_changed: _set_volume,
          on_bgm_volume_changed: _set_bgm_volume,
          on_sound_volume_changed: _set_sound_volume,
        }),
        () => lf2.dispose(),
      )

    return () => {
      invoker.invoke()
    };
  }, [LF2, sobj, hobj]);

  const on_click_load_local_zip = () => {
    if (!lf2) return;
    open_file({ accept: ".zip" })
      .then((v) => Ditto.Zip.read_file(v[0]))
      .then((v) => lf2.load(v))
      .catch((e) => Log.print("App -> on_click_load_local_zip", e));
  };

  const on_click_download_zip = () => {
    const download = (url: string) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = url;
      a.click();
    }
    download("data.zip.json")
    download("data.zip")
    download("prel.zip.json")
    download("prel.zip")
  };

  const on_click_load_builtin = async () => {
    if (!lf2) return;
    lf2
      .load("prel.zip.json")
      .then(() => lf2.load("data.zip.json"))
      .catch((e) => Log.print("App -> on_click_load_builtin", e));
  };

  useEffect(() => {
    const ele = ele_game_canvas;
    const contaner = ele?.parentElement
    if (!ele || !contaner) return;
    const scale: number = render_fixed_scale || custom_render_fixed_scale;
    const on_resize = () => {
      const screen_w = 794;
      const screen_h = 450;
      const { width, height } = contaner.getBoundingClientRect()
      const win_w = Math.floor(width);
      const win_h = Math.floor(height);
      let view_w = win_w;
      let view_h = win_h;
      const s_1 = screen_w / screen_h;
      const s_2 = win_w / win_h;
      switch (render_size_mode) {
        case "fill":
          ele.style.width = win_w + "px";
          ele.style.height = win_h + "px";
          break;
        case "cover":
          if (s_1 > s_2) {
            ele.style.height = win_h + "px";
            ele.style.width = (view_w = win_h * s_1) + "px";
          } else {
            ele.style.width = win_w + "px";
            ele.style.height = (view_h = win_w / s_1) + "px";
          }
          break;
        case "contain":
          if (s_1 > s_2) {
            ele.style.width = win_w + "px";
            ele.style.height = (view_h = win_w / s_1) + "px";
          } else {
            ele.style.height = win_h + "px";
            ele.style.width = (view_w = win_h * s_1) + "px";
          }
          break;
        case "fixed":
        default:
          ele.style.width = (view_w = scale * screen_w) + "px";
          ele.style.height = (view_h = scale * screen_h) + "px";
          break;
      }
      const h_align_ = h_align < -1 ? custom_h_align : h_align;
      const v_align_ = v_align < -1 ? custom_v_align : v_align;
      ele.style.left = Math.floor((win_w - view_w) * h_align_) + "px";
      ele.style.top = Math.floor((win_h - view_h) * v_align_) + "px";
    };
    window.addEventListener("resize", on_resize);
    on_resize();

    const resize_ob = new ResizeObserver(on_resize)
    if (game_cell) resize_ob.observe(game_cell)

    return () => {
      window.removeEventListener("resize", on_resize)
      resize_ob.disconnect()
    };
  }, [
    game_cell,
    render_size_mode,
    render_fixed_scale,
    custom_render_fixed_scale,
    v_align,
    h_align,
    custom_h_align,
    custom_v_align,
    ele_game_canvas
  ]);

  const player_infos = lf2?.players;
  const players = useMemo(() => {
    if (!player_infos) return [];
    return Array.from(player_infos.values());
  }, [player_infos]);

  const touch_pad_player_items = useMemo(
    () => [
      { value: "", label: "触控板: 关闭" },
      ...players.map((v) => ({ value: v.id, label: "触控板: 玩家" + v.id })),
    ],
    [players],
  );

  useShortcut("F8", 0, () => lf2?.weapons.add_random(9));
  useShortcut("F9", 0, () => lf2?.world.stage.kill_all_enemies());
  useShortcut("F10", 0, () => {
    if (lf2) for (const e of lf2.world.entities) if (is_weapon(e)) e.hp = 0;
  });

  useShortcut("F11", 0, () => toggle_fullscreen());
  useShortcut("ctrl+F1", 0, () => lf2?.is_cheat_enabled(CheatType.GIM_INK) && set_control_panel_visible((v) => !v));
  useShortcut("ctrl+F3", 0, () => lf2?.is_cheat_enabled(CheatType.GIM_INK) && set_game_overlay((v) => !v));
  useEffect(() => {

    const ele = ele_game_canvas;
    if (!ele) return;
    if (ui_id) {
      ele.style.transition = "opacity 1000ms";
      ele.style.opacity = "1";
    } else {
      ele.style.opacity = "0";
    }
  }, [ui_id, ele_game_canvas]);

  useEffect(() => {
    if (!lf2) return;
    (lf2.pointings as __Pointings).set_element(ele_game_canvas);
    (lf2.world.renderer as WorldRenderer).scene.set_canvas(ele_game_canvas);
  }, [lf2, ele_game_canvas])

  useWorkspaces({ container: ele_root })

  useEffect(() => {
    if (!ele_root) return;
    const adpater = new DomAdapter(ele_root)
    const workspace = new Workspaces(adpater)
    const game_slot = workspace.root;

    workspace.on_leaves_changed = () => {
      for (const leaf of workspace.leaves) {
        const cell = workspace.adapter.get_cell(leaf)
        if (!cell || cell.children.length) continue;
        if (!cell.parentElement) workspace.adapter.container.appendChild(cell)
      }
      const pannel_slot = workspace.find("panel")
      set_workspace([
        workspace,
        adpater,
        adpater.get_cell(game_slot) ?? null,
        pannel_slot ? adpater.get_cell(pannel_slot) || null : null
      ])
    }
    workspace.confirm()
    return () => {
      workspace.on_leaves_changed = void 0
      workspace.root.release()
      workspace.release()
    }
  }, [ele_root])

  useEffect(() => {
    if (!workspace) return;
    workspace.del("panel");
    if (control_panel_visible) {
      switch (debug_ui_pos) {
        case "left": workspace.add("slot_1", debug_ui_pos, { id: "panel" }); break;
        case "right": workspace.add("slot_1", debug_ui_pos, { id: "panel" }); break;
        case "top": workspace.add("slot_1", "up", { id: "panel" }); break;
        case "bottom": workspace.add("slot_1", "down", { id: "panel" }); break;
      }
      workspace.root.keep = true
    }
    workspace.confirm()
  }, [workspace, debug_ui_pos, control_panel_visible])


  const game_cell_view = game_cell ? createPortal(
    <div className={styles.game_contiainer}>
      <canvas
        ref={set_ele_game_canvas}
        tabIndex={-1}
        className={styles.game_canvas}
        width={794}
        height={450}
        draggable={false}
        onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
        onContextMenuCapture={e => { e.preventDefault(); e.stopPropagation(); }}
      />
      <div ref={set_ele_game_overlay} className={classNames(styles.game_overlay, { [styles.gone]: !game_overlay })} />
      <DanmuOverlay lf2={lf2} />
      <GamePad player_id={touch_pad_on} lf2={lf2} />
      <Loading loading={!ui_id} big className={styles.loading_img} />
      <div className={styles.debug_pannel}>
        <Show show={lf2?.is_cheat_enabled(CheatType.GIM_INK)}>
          <ToggleImgButton
            checked={control_panel_visible}
            onClick={() => set_control_panel_visible((v) => !v)}
            src={[img_btn_1_2, img_btn_1_3]}
          />
        </Show>
        <ToggleImgButton
          checked={is_fullscreen}
          onClick={() => toggle_fullscreen()}
          src={[img_btn_3_1, img_btn_3_2]}
        />
        <ToggleImgButton
          checked={bgm_muted}
          onClick={() => lf2?.sounds?.set_bgm_muted(!bgm_muted)}
          src={[img_btn_2_0, img_btn_3_0]}
        />
        <ToggleImgButton
          checked={sound_muted}
          onClick={() => lf2?.sounds?.set_sound_muted(!sound_muted)}
          src={[img_btn_0_3, img_btn_1_0]}
        />
        <Show
          show={bg_id !== Defines.VOID_BG.id && ui_id !== "ctrl_settings"}
        >
          <ToggleImgButton
            checked={paused}
            onClick={() => lf2?.world.set_paused(!paused)}
            src={[img_btn_2_1, img_btn_2_2]}
          />
        </Show>
        <Show
          show={
            uis.length > 1 &&
            !loading &&
            ui_id !== "launch" &&
            ui_id !== "ctrl_settings"
          }
        >
          <ToggleImgButton
            onClick={() => {
              lf2?.world.set_paused(true);
              lf2?.push_ui("ctrl_settings");
            }}
            src={[img_btn_1_1, img_btn_1_1]}
          />
        </Show>
        <Show show={ui_id && Number(lf2?.ui_stacks[0]?.uis?.length) > 1}>
          <ToggleImgButton
            onClick={() => lf2?.pop_ui_safe()}
            src={[img_btn_2_3]}
          />
        </Show>
      </div>
    </div>, game_cell, null) : null

  const pannel_cell_view = pannel_cell ? createPortal(
    <div className={classNames(styles.debug_ui, styles["debug_ui_" + debug_ui_pos])}>
      <div className={styles.settings_row}>
        <Button onClick={on_click_download_zip}>下载数据包</Button>
        <Button onClick={on_click_load_local_zip} disabled={loading}>
          加载数据包
        </Button>
        <Button onClick={on_click_load_builtin} disabled={loading}>
          加载内置数据
        </Button>
        <Button onClick={() => set_dat_viewer_open(true)}>查看dat文件</Button>
        <Button onClick={() => set_editor_open(true)}>查看数据包</Button>
        <Select
          items={["top", "bottom", "left", "right"] as const}
          parse={(v) => [v, "位置：" + v]}
          value={debug_ui_pos}
          onChange={v => set_debug_ui_pos(v!)}
        />
        <Button
          style={{ marginLeft: "auto" }}
          onClick={() => set_control_panel_visible(false)}
        >
          ✕
        </Button>
      </div>
      <div className={styles.settings_row}>
        <Combine>
          <ToggleButton
            onChange={(v) => lf2?.sounds.set_muted(v)}
            value={muted}
          >
            <>音量</>
            <>静音</>
          </ToggleButton>
          <Show show={!muted}>
            <InputNumber
              precision={0}
              min={0}
              max={100}
              step={1}
              value={Math.ceil(volume * 100)}
              onChange={(e) =>
                lf2?.sounds.set_volume(e! / 100)
              }
            />
          </Show>
          <ToggleButton
            onChange={(v) => lf2?.sounds.set_bgm_muted(v)}
            value={bgm_muted}>
            <>音乐</>
            <>音乐(已禁用)</>
          </ToggleButton>
          <Show show={!bgm_muted}>
            <InputNumber
              precision={0}
              min={0}
              max={100}
              step={1}
              value={Math.ceil(bgm_volume * 100)}
              onChange={(e) =>
                lf2?.sounds.set_bgm_volume(e! / 100)
              }
            />
          </Show>
          <ToggleButton
            onChange={(v) => lf2?.sounds.set_sound_muted(v)}
            value={sound_muted}>
            <>音效</>
            <>音效(已禁用)</>
          </ToggleButton>
          <Show show={!sound_muted}>
            <InputNumber
              precision={0}
              min={0}
              max={100}
              step={1}
              value={Math.ceil(sound_volume * 100)}
              onChange={(e) =>
                lf2?.sounds.set_sound_volume(e! / 100)
              }
            />
          </Show>
        </Combine>
      </div>
      <div className={styles.settings_row}>
        <Select
          placeholder="页面"
          value={ui_id}
          onChange={v => lf2?.set_ui(v!)}
          items={uis}
          parse={(o) => [o.id!, o.name]}
        />
        <Titled float_label="显示模式">
          <Select
            value={render_size_mode}
            onChange={v => set_render_size_mode(v!)}
            placeholder="显示模式"
            parse={i => [i, i]}
            items={["fixed", "fill", "cover", "contain"] as const}
          />
        </Titled>
        <Show show={render_size_mode === "fixed"}>
          <Titled float_label="缩放">
            <Combine>
              <Select
                value={render_fixed_scale}
                onChange={v => set_render_fixed_scale(v!)}
                items={arithmetic_progression(0, 4, 0.5)}
                parse={(i) => [i, "✕" + (i || "?")]}
              />
              <Show show={!render_fixed_scale}>
                <InputNumber
                  precision={2}
                  min={0}
                  step={custom_render_fixed_scale <= 0.5 ? 0.1 : 0.5}
                  value={custom_render_fixed_scale}
                  onChange={(e) =>
                    set_custom_render_fixed_scale(e!)
                  } />
              </Show>
            </Combine>
          </Titled>
        </Show>
        <Show show={render_size_mode !== "fill"}>
          <Titled float_label="对齐">
            <Combine>
              <Select
                value={v_align}
                onChange={v => set_v_align(v!)}
                items={[-2, 0, 0.5, 1]}
                parse={(v, idx) => [
                  v, v <= -1 ? "?" : ["上", "中", "下"][idx - 1],
                ]}
              />
              <Show show={v_align < 0}>
                <InputNumber
                  precision={2}
                  min={-1}
                  max={2}
                  step={0.1}
                  value={custom_v_align}
                  onChange={(e) => set_custom_v_align(e!)}
                />
              </Show>
              <Select
                value={h_align}
                onChange={v => set_h_align(v!)}
                items={[-2, 0, 0.5, 1]}
                parse={(v, idx) => [
                  v,
                  v <= -1 ? "?" : ["左", "中", "右"][idx - 1],
                ]}
              />
              <Show show={h_align < 0}>
                <InputNumber
                  precision={2}
                  min={-1}
                  max={2}
                  step={0.1}
                  value={custom_h_align}
                  onChange={(e) => set_custom_h_align(e!)}
                />
              </Show>
            </Combine>
          </Titled>
        </Show>
      </div>
      <div className={styles.settings_row}>
        <Combine>
          <ToggleButton
            value={paused}
            onClick={() => lf2?.world.set_paused(!paused)}
          >
            <>游戏暂停</>
            <>游戏暂停✓</>
          </ToggleButton>
          <Button onClick={update_once}>
            更新一帧
          </Button>
          <ToggleButton
            value={fast_forward}
            onClick={() => set_fast_forward(!fast_forward)}
          >
            <>不限速度</>
            <>不限速度✓</>
          </ToggleButton>
        </Combine>

        <Combine>
          {
            Object.keys(INDICATINGS).map(k => {
              const key = k as Indicating;
              const num = INDICATINGS[key]
              return (
                <ToggleButton
                  key={key}
                  value={!!(indicator_flags & num)}
                  onClick={() => set_indicator_flags(v => toggle_bit(v, num))}>
                  <>{k}</>
                  <>{k}✓</>
                </ToggleButton>
              )
            })
          }
        </Combine>
        <Combine>
          <ToggleButton
            title="ctrl+F3"
            value={game_overlay}
            onChange={set_game_overlay}
          >
            <>游戏覆盖</>
            <>游戏覆盖✓</>
          </ToggleButton>
          <ToggleButton
            onClick={toggle_fullscreen}
            value={fullscreen.is_fullscreen}
          >
            <>全屏</>
            <>全屏✓</>
          </ToggleButton>
          <StatusButton
            items={[
              { value: 0, label: "非同步渲染✓" },
              { value: 1, label: "同步渲染✓" },
              { value: 2, label: "同步渲染(x0.5)✓" },
            ]}
            parse={i => [i.value, i.label]}
            value={sync_render}
            onClick={() => { if (lf2) lf2.world.sync_render = (lf2.world.sync_render + 1) % 3 }}
          />

        </Combine>
      </div>
      <div className={styles.settings_row}>
        <Combine>
          <ToggleButton
            onChange={() =>
              set_showing_panel((v) => (v === "stage" ? "" : "stage"))
            }
            value={showing_panel === "stage"}
          >
            <>关卡面板</>
            <>关卡面板✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() =>
              set_showing_panel((v) => (v === "bg" ? "" : "bg"))
            }
            value={showing_panel === "bg"}
          >
            <>背景面板</>
            <>背景面板✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() =>
              set_showing_panel((v) => (v === "weapon" ? "" : "weapon"))
            }
            value={showing_panel === "weapon"}
          >
            <>武器面板</>
            <>武器面板✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() =>
              set_showing_panel((v) => (v === "bot" ? "" : "bot"))
            }
            value={showing_panel === "bot"}
          >
            <>Bot面板</>
            <>Bot面板✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() =>
              set_showing_panel((v) => (v === "player" ? "" : "player"))
            }
            value={showing_panel === "player"}
          >
            <>玩家面板</>
            <>玩家面板✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() =>
              set_showing_panel((v) =>
                v === "world_tuning" ? "" : "world_tuning",
              )
            }
            value={showing_panel === "world_tuning"}>
            <>世界微调</>
            <>世界微调✓</>
          </ToggleButton>
        </Combine>
        <Combine>
          <StatusButton
            value={touch_pad_on}
            items={touch_pad_player_items}
            parse={i => [i.value, i.label]}
            onChange={(v) => set_touch_pad_on(v!)} />
          <ToggleButton
            onChange={() => lf2?.toggle_cheat_enabled(CheatType.LF2_NET)}
            value={cheat_1}>
            <>LF2_NET</>
            <>LF2_NET✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() => lf2?.toggle_cheat_enabled(CheatType.HERO_FT)}
            value={cheat_2}>
            <>HERO_FT</>
            <>HERO_FT✓</>
          </ToggleButton>
          <ToggleButton
            onChange={() => lf2?.toggle_cheat_enabled(CheatType.GIM_INK)}
            value={cheat_3}>
            <>GIM_INK</>
            <>GIM_INK✓</>
          </ToggleButton>
        </Combine>
      </div>
      <Show show={showing_panel === "player"}>
        {players.map((info, idx) => (
          <PlayerRow
            key={idx}
            lf2={lf2!}
            info={info}
            touch_pad_on={touch_pad_on === info.id}
            on_click_toggle_touch_pad={() =>
              set_touch_pad_on(touch_pad_on === info.id ? "" : info.id)
            }
          />
        ))}
      </Show>
      <SettingsRows
        lf2={lf2}
        show_stage_settings={showing_panel === "stage"}
        show_bg_settings={showing_panel === "bg"}
        show_weapon_settings={showing_panel === "weapon"}
        show_bot_settings={showing_panel === "bot"}
        show_world_tuning={showing_panel === "world_tuning"}
      />
    </div>, pannel_cell, null) : null

  return (
    <>
      <div className={styles.app} ref={set_ele_root} />
      {game_cell_view}
      {pannel_cell_view}
      {dat_viewer_open ? <DatViewer open={dat_viewer_open} onClose={() => set_dat_viewer_open(false)} /> : void 0}
      <EditorView
        open={editor_open}
        onClose={() => set_editor_open(false)}
        style={{ background: 'black', position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 1 }}
        lf2={lf2} />
      {(sobj.network === '1' || hobj.network === '1') && <Networking lf2={lf2} />}
    </>
  );
}
function toggle_bit(v: number, b: number): number {
  return v & b ? v ^ b : v | b
}
export default App;

