# XML 读写字段检查表

> 每个 interface 一行，标记字段在 `xml_from_*`（写）和 `xml_to_*`（读）中的覆盖情况。
> ✅ = 已覆盖  ❌ = 缺失  — = 运行时字段（不序列化）

---

## 基础数据类型

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IDatIndex` | `xml_from/to_dat_index` | id, type, file | ✅ | ✅ | |
| | | hash, alias, groups, skipped, bot | ✅ | ✅ | |
| `IDataLists` | `xml_from/to_data_lists` | objects, backgrounds, stages, bots | ✅ | ✅ | |

---

## 实体相关

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IEntityInfo` | `xml_from/to_entity_info` | name | ✅ | ✅ | 必填 |
| | | head, small | ✅ | ✅ | |
| | | type, ce | ✅ | ✅ | |
| | | weight, strength | ✅ | ✅ | |
| | | bounce_y/x/z (soft: `bounce`) | ✅ | ✅ | x,y,z 顺序 |
| | | bounce_min_y/x/z (soft: `bounce_min`) | ✅ | ✅ | |
| | | fast_vy/x/z (soft: `fast`) | ✅ | ✅ | |
| | | drop_hurt, resting_max | ✅ | ✅ | |
| | | group, hit_sounds, drop_sounds, dead_sounds | ✅ | ✅ | |
| | | bot_id | ✅ | ✅ | attr + `<bot>` 子元素 |
| | | files → `<files>/<file>` | ✅ | ✅ | name, path, row, col, cell_w, cell_h, variants |
| | | portraits → `<portraits>/<portrait>` | ✅ | ✅ | name, tex, x, y, w, h |
| | | drink → `<drink>` | ✅ | ✅ | 子函数 |
| | | armor → `<armor>` | ✅ | ✅ | 子函数 |
| | | brokens → `<opoint>` | ✅ | ✅ | IOpointInfo[] |
| | | models | ✅ | ✅ | |
| | | bot | — | — | 运行时 |
| | | dataset (IWorldDataset) | ✅ | ✅ | xml_from/to_world_dataset |
| `IEntityData` | `xml_from/to_entity_data` | id, base | ✅ | ✅ | 复用 IEntityInfo |
| | | frames → `<frame>` | ✅ | ✅ | 复用 IFrameInfo |
| | | on_dead, on_exhaustion → `<on_dead>` `<on_exhaustion>` | ✅ | ✅ | TNextFrame, 支持数组 |
| | | bdy_prefabs → `<bdy_prefab>` | ✅ | ✅ | 复用 IBdyInfo |
| | | itr_prefabs → `<itr_prefab>` | ✅ | ✅ | 复用 IItrInfo |
| | | indexes → `<indexes>/<key>` | ✅ | ✅ | |
| | | processed | — | — | 运行时 |

---

## 帧相关

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IFrameInfo` | `xml_from/to_frame_info` | id | ✅ | ✅ | |
| | | pic → `<pic>` | ✅ | ✅ | tex, x, y, w, h |
| | | next → `<next>` | ✅ | ✅ | TNextFrame, 支持数组 |
| | | hit → `<hit>` | ✅ | ✅ | 按键映射 |
| | | hold → `<hold>` | ✅ | ✅ | |
| | | key_down → `<key_down>` | ✅ | ✅ | |
| | | key_up → `<key_up>` | ✅ | ✅ | |
| | | bpoint → `<bpoint>` | ✅ | ✅ | x, y, z, r |
| | | wpoint → `<wpoint>` | ✅ | ✅ | kind, x, y, z, weaponact, attacking, dv(soft) |
| | | cpoint → `<cpoint>` | ✅ | ✅ | kind, x, y, z, injury, hurtable, decrease, throwv(soft), throwinjury, fronthurtact, backhurtact, shaking |
| | | bdy → `<bdy>` | ✅ | ✅ | 复用 IBdyInfo |
| | | itr → `<itr>` | ✅ | ✅ | 复用 IItrInfo |
| | | opoint → `<opoint>` | ✅ | ✅ | 复用 IOpointInfo |
| `INextFrame` | `xml_from/to_next_frame` | id, wait, facing | ✅ | ✅ | |
| | | mp, hp, blink_time | ✅ | ✅ | |
| | | dvx/y/z (soft: `dv`) | ✅ | ✅ | |
| | | acc_x/y/z (soft: `acc`) | ✅ | ✅ | |
| | | vxm/y/z (soft: `vm`) | ✅ | ✅ | |
| | | ctrl_x/y/z (soft: `ctrl`) | ✅ | ✅ | |
| | | sounds | ✅ | ✅ | |
| | | expression → `<expression>` | ✅ | ✅ | 子元素 |

---

## 碰撞框

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IBdyInfo` | `xml_from/to_bdy_info` | id, name | ✅ | ✅ | |
| | | ref / prefab_id | ✅ | ✅ | |
| | | kind | ✅ | ✅ | |
| | | hit_flag | ✅ | ✅ | |
| | | x,y,w,h,z,l (qube: `qube`) | ✅ | ✅ | 简写 |
| | | test | ✅ | ✅ | |
| | | code | ✅ | ✅ | num\|str |
| | | hit_flag_name, kind_name | — | — | 运行时 |
| | | indicator_info | — | — | 运行时 |
| | | actions, tester | — | — | 运行时 |
| `IItrInfo` | `xml_from/to_itr_info` | id, name | ✅ | ✅ | |
| | | ref / prefab_id | ✅ | ✅ | |
| | | kind | ✅ | ✅ | |
| | | hit_flag | ✅ | ✅ | |
| | | x,y,w,h,z,l (qube: `qube`) | ✅ | ✅ | 简写 |
| | | dvx/y/z (soft: `dv`) | ✅ | ✅ | |
| | | effect | ✅ | ✅ | |
| | | injury | ✅ | ✅ | |
| | | vrest, fall, arest | ✅ | ✅ | |
| | | bdefend | ✅ | ✅ | |
| | | motionless, shaking | ✅ | ✅ | |
| | | test | ✅ | ✅ | |
| | | code | ✅ | ✅ | num\|str |
| | | catchingact → `<catchingact>` | ✅ | ✅ | TNextFrame, 支持数组 |
| | | caughtact → `<caughtact>` | ✅ | ✅ | TNextFrame, 支持数组 |
| | | on_hit_ground → `<on_hit_ground>` | ✅ | ✅ | TNextFrame |
| | | kind_name, effect_name, hit_flag_name | — | — | 运行时 |
| | | indicator_info, actions, tester | — | — | 运行时 |

---

## 生成点

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IOpointInfo` | `xml_from/to_opoint` | id, name | ✅ | ✅ | |
| | | kind | ✅ | ✅ | |
| | | x, y, z | ✅ | ✅ | |
| | | origin_type | ✅ | ✅ | |
| | | oid | ✅ | ✅ | strs → str\|strs |
| | | action → `<action>` | ✅ | ✅ | TNextFrame, 支持数组 |
| | | multi (num\|`<multi>`) | ✅ | ✅ | |
| | | dvx/y/z (soft: `dv`) | ✅ | ✅ | |
| | | max_hp, hp, max_mp, mp | ✅ | ✅ | |
| | | speedz | ✅ | ✅ | |
| | | spreading | ✅ | ✅ | |
| | | is_entity | ✅ | ✅ | bool |
| | | interval, interval_id, interval_mode | ✅ | ✅ | |
| | | motionless | ✅ | ✅ | |
| | | spreading_x/y/z | ✅ | ✅ | nums |
| | | unimportant, delay | ✅ | ✅ | |
| | | inherit_speed_x/y/z (soft: `inherit_speed`) | ✅ | ✅ | |
| | | indicator_info | — | — | 运行时 |
| | | __spreading_random_* | — | — | 运行时 |

---

## 武装/饮料/背景

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IArmorInfo` | `xml_from/to_armor_info` | id, name | ✅ | ✅ | |
| | | type (str) | ✅ | ✅ | ArmorEnum\|string |
| | | toughness | ✅ | ✅ | |
| | | fireproof, antifreeze | ✅ | ✅ | |
| | | fulltime (bool) | ✅ | ✅ | |
| | | injury_ratio, shaking_ratio, motionless_ratio | ✅ | ✅ | |
| | | hit_sounds, dead_sounds | ✅ | ✅ | |
| `IDrinkInfo` | `xml_from/to_drink_info` | id, name | ✅ | ✅ | |
| | | hp_h_total/value/ticks (soft: `hp_h`) | ✅ | ✅ | |
| | | hp_r_total/value/ticks (soft: `hp_r`) | ✅ | ✅ | |
| | | mp_h_total/value/ticks (soft: `mp_h`) | ✅ | ✅ | |
| `IBgData` | `xml_from/to_bg_data` | id, base, layers, dataset | ✅ | ✅ | 原有实现，未改动 |

---

## 关卡

| Interface | 文件 | 字段 | 写入 | 读取 | 备注 |
|-----------|------|------|:--:|:--:|------|
| `IStageInfo` | `xml_from/to_stage_info` | id, name, bg | ✅ | ✅ | |
| | | phases → `<phase>` | ✅ | ✅ | 复用 IStagePhaseInfo |
| | | chapter, next, cond_end, act_of_goto_next | ✅ | ✅ | |
| | | is_starting, starting_name, title, group | ✅ | ✅ | |
| `IStagePhaseInfo` | `xml_from/to_stage_phase_info` | title, desc, music | ✅ | ✅ | |
| | | bound | ✅ | ✅ | |
| | | player_l/r, camera_l/r, enemy_l/r, drink_l/r | ✅ | ✅ | |
| | | cam_jump_to_x, player_jump_to_x/z | ✅ | ✅ | |
| | | respawn, respawn_r, respawn_x, health_up, mp_up | ✅ | ✅ | diff_map 格式 |
| | | objects → `<object>` | ✅ | ✅ | 复用 IStageObjectInfo |
| | | sounds | ✅ | ✅ | |
| | | end_test | ✅ | ✅ | |
| | | on_start, on_end | ✅ | ✅ | |
| | | dialogs | ✅ | ✅ | |
| | | hide_stats, world_pause, control_disabled, weapon_rain_disabled | ✅ | ✅ | |
| | | player_facing | ✅ | ✅ | |
| | | end_testers | — | — | 运行时 |
| `IStageObjectInfo` | `xml_from/to_stage_object_info` | id, x | ✅ | ✅ | |
| | | y, z, act, facing | ✅ | ✅ | |
| | | hp, mp | ✅ | ✅ | |
| | | times, ratio | ✅ | ✅ | |
| | | is_boss, is_soldier (bool) | ✅ | ✅ | |
| | | reserve, join, join_team, outline_color | ✅ | ✅ | |
| | | id_method | ✅ | ✅ | |
| | | hp_map, mp_map | ✅ | ✅ | diff_map |

---

## 图例

- ✅ = 读写齐全
- ❌ = 缺失（需补全）
- — = 运行时字段，不参与序列化
- _(soft)_ = 使用 `xxx_attr_soft` 简写格式（尾部 void 自动裁剪）
