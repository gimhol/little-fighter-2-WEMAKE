import { GK, StateEnum } from "../defines";
import { BotController } from "./BotController";
export enum DummyEnum {
  None = '',
  LockAtMid_Stand = "1",
  LockAtMid_Defend = "2",
  LockAtMid_RowingWhenFalling = "3",
  LockAtMid_JumpAndRowingWhenFalling = "4",
  AvoidEnemyAllTheTime = "5",
  LockAtMid_dUa = "6",
  LockAtMid_dUj = "7",
  LockAtMid_dDa = "8",
  LockAtMid_dDj = "9",
  LockAtMid_dLa = "10",
  LockAtMid_dLj = "11",
  LockAtMid_dRa = "12",
  LockAtMid_dRj = "13",
  LockAtMid_dja = "14",
  LockAtMid_dUa_auto = "15",
  LockAtMid_dUj_auto = "16",
  LockAtMid_dDa_auto = "17",
  LockAtMid_dDj_auto = "18",
  LockAtMid_dLa_auto = "18",
  LockAtMid_dLj_auto = "19",
  LockAtMid_dRa_auto = "20",
  LockAtMid_dRj_auto = "21",
  LockAtMid_dja_auto = "22"
}
export const dummy_updaters: Record<DummyEnum, IDummyUpdater | undefined> = {
  [DummyEnum.None]: {
    update: () => { }
  },
  [DummyEnum.LockAtMid_Stand]: {
    update: (self) => {
      self.lock_when_stand_and_rest();
    }
  },
  [DummyEnum.LockAtMid_Defend]: {
    update: (self) => {
      const keys = [GK.d]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys);
    }
  },
  [DummyEnum.LockAtMid_RowingWhenFalling]: {
    update: (self) => {
      self.lock_when_stand_and_rest();
      if (self.entity.frame.state === StateEnum.Falling) {
        self.key_down(GK.j).key_up(GK.j);
      }
    }
  },
  [DummyEnum.LockAtMid_JumpAndRowingWhenFalling]: {
    update: (self) => {
      const h = self.lock_when_stand_and_rest();
      if (h || self.entity.frame.state === StateEnum.Falling) {
        self.key_down(GK.j).key_up(GK.j);
      } else {
        self.end(GK.j);
      }
    }
  },
  [DummyEnum.AvoidEnemyAllTheTime]: {
    update: (self) => {
      // self.avoid_enemy();
    }
  },
  [DummyEnum.LockAtMid_dUa]: {
    update: (self) => {
      const keys = [GK.d, GK.U, GK.a]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dUj]: {
    update: (self) => {
      const keys = [GK.d, GK.U, GK.j]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dDa]: {
    update: (self) => {
      const keys = [GK.d, GK.D, GK.a]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dDj]: {
    update: (self) => {
      const keys = [GK.d, GK.D, GK.j]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dLa]: {
    update: (self) => {
      const keys = [GK.d, GK.L, GK.a]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dLj]: {
    update: (self) => {
      const keys = [GK.d, GK.L, GK.j]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dRa]: {
    update: (self) => {
      const keys = [GK.d, GK.R, GK.a]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dRj]: {
    update: (self) => {
      const keys = [GK.d, GK.L, GK.j]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dja]: {
    update: (self) => {
      const keys = [GK.d, GK.j, GK.a]
      const h = self.lock_when_stand_and_rest();
      if (h) self.key_down(...keys).key_up(...keys)
    }
  },
  [DummyEnum.LockAtMid_dUa_auto]: undefined,
  [DummyEnum.LockAtMid_dUj_auto]: undefined,
  [DummyEnum.LockAtMid_dDa_auto]: undefined,
  [DummyEnum.LockAtMid_dDj_auto]: undefined,
  [DummyEnum.LockAtMid_dLj_auto]: undefined,
  [DummyEnum.LockAtMid_dRa_auto]: undefined,
  [DummyEnum.LockAtMid_dRj_auto]: undefined,
  [DummyEnum.LockAtMid_dja_auto]: undefined
}
export interface IDummyUpdater {
  update(self: BotController): void
}