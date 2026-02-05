import { ICollision, ICollisionHandler } from "../base";
import { ALL_ENTITY_ENUM, BdyKind, BuiltIn_OID, EntityEnum, EntityGroup, ItrKind, TEntityEnum } from "../defines";
import { Ditto } from "../ditto";
import { is_ball, is_fighter, is_weapon } from "../entity";
import { collision_action_handlers } from "../entity/collision_action_handlers";
import { handle_ball_frozen } from "./handle_ball_frozen";
import { handle_ball_hit_other } from "./handle_ball_hit_other";
import { handle_ball_is_hit } from "./handle_ball_is_hit";
import { handle_body_goto as handle_criminal_hit } from "./handle_body_goto";
import { handle_healing } from "./handle_healing";
import { handle_itr_kind_catch } from "./handle_itr_kind_catch";
import { handle_itr_kind_force_catch } from "./handle_itr_kind_force_catch";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_itr_kind_magic_flute } from "./handle_itr_kind_magic_flute";
import { handle_itr_kind_whirlwind } from "./handle_itr_kind_whirlwind";
import { handle_itr_normal_bdy_defend } from "./handle_itr_normal_bdy_defend";
import { handle_itr_normal_bdy_normal } from "./handle_itr_normal_bdy_normal";
import { handle_john_shield_hit_other_ball } from "./handle_john_shield_hit_other_ball";
import { handle_rest } from "./handle_rest";
import { handle_super_punch_me } from "./handle_super_punch_me";
import { handle_weapon_hit_other } from "./handle_weapon_hit_other";
import { handle_weapon_is_hit } from "./handle_weapon_is_hit";
import { handle_weapon_is_picked } from "./handle_weapon_is_picked";
import { handle_weapon_is_picked_secretly } from "./handle_weapon_is_picked_secretly";

export class CollisionKeeper {
  protected pair_map: Map<string, ((collision: ICollision) => void)[]> = new Map();
  add(
    a_type_list: TEntityEnum[],
    itr_kind_list: ItrKind[],
    v_type_list: TEntityEnum[],
    bdy_kind_list: BdyKind[],
    fn: (collision: ICollision) => void,
  ) {
    for (const itr_kind of itr_kind_list) {
      for (const a_type of a_type_list) {
        for (const bdy_kind of bdy_kind_list) {
          for (const v_type of v_type_list) {
            const key = [a_type, itr_kind, v_type, bdy_kind].join("_")
            const fns = this.pair_map.get(key) || []
            fns.push(fn)
            this.pair_map.set(key, fns);
          }
        }
      }
    }
  }
  adds(...list: ICollisionHandler[]) {
    for (const i of list) {
      this.add(i.a_type, i.itr, i.v_type, i.bdy, i.run.bind(i));
    }
  }
  get(
    a_type: TEntityEnum,
    itr_kind: ItrKind,
    v_type: TEntityEnum,
    bdy_kind: BdyKind,
  ) {
    if (itr_kind === void 0) {
      console.warn("[CollisionHandler] itr.kind got", itr_kind);
      debugger;
    }
    if (bdy_kind === void 0) {
      console.warn("[CollisionHandler] bdy.kind got", bdy_kind);
      debugger;
    }
    return this.pair_map.get(`${a_type}_${itr_kind}_${v_type}_${bdy_kind}`);
  }
  handler(collision: ICollision) {
    return this.get(
      collision.attacker.data.type,
      collision.itr.kind,
      collision.victim.data.type,
      collision.bdy.kind,
    )
  }
  handle(collision: ICollision) {
    const { handlers } = collision;
    if (Ditto.DEV && handlers) {
      const collision_desc =
        `[${collision.attacker.data.type}]#${ItrKind[collision.itr.kind]} => ` +
        `[${collision.victim.data.type}]#${BdyKind[collision.bdy.kind]}`;
      Ditto.debug(` collision: ${collision_desc} \nhandlers: ${handlers?.map(v => v.name) ?? 'none'}`)
    }

    let ball_hit = false;
    const { itr, bdy, victim, attacker } = collision;
    const itr_tests = itr.actions?.map(v => v.pretest && v.tester?.run(collision) !== false)
    const bdy_tests = bdy.actions?.map(v => v.pretest && v.tester?.run(collision) !== false)

    handlers?.forEach(fn => {
      ball_hit = ball_hit || fn === handle_ball_is_hit;
      return fn(collision)
    })

    if (
      is_ball(attacker) &&
      is_ball(victim) &&
      attacker.group?.some(v => v === EntityGroup.FreezableBall) &&
      victim.group?.some(v => v === EntityGroup.Freezer)
    ) {
      handle_ball_frozen(victim, attacker);
    } else if (
      is_ball(victim) &&
      victim.group?.some(v => v === EntityGroup.FreezableBall) &&
      attacker.group?.some(v => v === EntityGroup.Freezer) && (
        is_fighter(attacker) ||
        is_ball(victim) ||
        (is_weapon(attacker) && attacker.bearer)
      )
    ) {
      handle_ball_frozen(attacker, victim);
    } else {
      itr.actions?.forEach((action, idx) => {
        const test_result = action.pretest ? itr_tests?.[idx] : action.tester?.run(collision);
        if (test_result === false) return;
        collision_action_handlers[action.type](action as any, collision)
      })
      bdy.actions?.forEach((action, idx) => {
        const test_result = action.pretest ? bdy_tests?.[idx] : action.tester?.run(collision);
        if (test_result === false) return;
        collision_action_handlers[action.type](action as any, collision)
      })
    }

    victim.collided_list.push((victim.lastest_collided = collision));
    attacker.collision_list.push((attacker.lastest_collision = collision));
    if (
      itr.kind !== ItrKind.Block &&
      itr.kind !== ItrKind.Whirlwind &&
      itr.kind !== ItrKind.MagicFlute &&
      itr.kind !== ItrKind.MagicFlute2 &&
      itr.kind !== ItrKind.Pick &&
      itr.kind !== ItrKind.PickSecretly
    ) {
      const sounds = victim.data.base.hit_sounds;
      victim.play_sound(sounds);
    }
  }
}
export const collisions_keeper = (window as any).collisions_keeper = new CollisionKeeper();
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Catch],
  [EntityEnum.Fighter],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_catch,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.ForceCatch],
  [EntityEnum.Fighter],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_force_catch,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Whirlwind],
  [EntityEnum.Fighter, EntityEnum.Weapon],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_whirlwind,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Freeze],
  [EntityEnum.Fighter],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_freeze,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [
    ItrKind.JohnShield,
    ItrKind.Normal,
    ItrKind.WeaponSwing,
    ItrKind.CharacterThrew,
  ],
  [EntityEnum.Fighter],
  [BdyKind.Normal],
  handle_itr_normal_bdy_normal,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [
    ItrKind.JohnShield,
    ItrKind.Normal,
    ItrKind.WeaponSwing,
    ItrKind.CharacterThrew,
  ],
  [EntityEnum.Fighter],
  [BdyKind.Defend],
  handle_itr_normal_bdy_defend,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.MagicFlute, ItrKind.MagicFlute2],
  [EntityEnum.Fighter, EntityEnum.Weapon],
  [BdyKind.Normal, BdyKind.Defend],
  handle_itr_kind_magic_flute,
);
collisions_keeper.add(
  [EntityEnum.Fighter],
  [ItrKind.Pick],
  [EntityEnum.Weapon],
  [BdyKind.Normal],
  handle_weapon_is_picked,
);
collisions_keeper.add(
  [EntityEnum.Fighter],
  [ItrKind.PickSecretly],
  [EntityEnum.Weapon],
  [BdyKind.Normal],
  handle_weapon_is_picked_secretly,
);

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [
    ItrKind.JohnShield,
    ItrKind.Normal,
    ItrKind.WeaponSwing,
    ItrKind.CharacterThrew,
  ],
  [EntityEnum.Weapon],
  [BdyKind.Normal],
  handle_weapon_is_hit,
);

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Block],
  [EntityEnum.Fighter],
  [BdyKind.Normal],
  handle_rest,
);

collisions_keeper.add(
  [EntityEnum.Ball],
  [ItrKind.Normal],
  ALL_ENTITY_ENUM,
  [BdyKind.Normal, BdyKind.Defend],
  handle_ball_hit_other
)

collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Normal, ItrKind.WeaponSwing, ItrKind.CharacterThrew],
  [EntityEnum.Ball],
  [BdyKind.Normal],
  handle_ball_is_hit
)
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.JohnShield],
  [EntityEnum.Ball],
  [BdyKind.Normal],
  handle_john_shield_hit_other_ball,
)

collisions_keeper.add(
  [EntityEnum.Weapon],
  [ItrKind.Normal],
  ALL_ENTITY_ENUM,
  [BdyKind.Normal, BdyKind.Defend],
  handle_weapon_hit_other
)
collisions_keeper.add(
  [EntityEnum.Weapon, EntityEnum.Fighter],
  [ItrKind.WeaponSwing, ItrKind.Normal],
  ALL_ENTITY_ENUM,
  [BdyKind.Criminal],
  handle_criminal_hit,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.Heal],
  [EntityEnum.Fighter],
  [BdyKind.Normal],
  handle_healing,
);
collisions_keeper.add(
  ALL_ENTITY_ENUM,
  [ItrKind.SuperPunchMe],
  [EntityEnum.Fighter],
  [BdyKind.Normal],
  handle_super_punch_me,
);

