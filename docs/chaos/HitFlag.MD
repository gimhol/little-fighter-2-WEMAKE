# HitFlag.MD

在LF2:WEMAKE中，bdy与itr的碰撞采用了更复杂的判定方式。

itr与bdy的碰撞盒相交时，还需要通过HitFlag判定来决定其之间能否产生碰撞。

这说明即使effect为“火烧”效果，或角色处于“冻结”状态时，能否（被）队友攻击，仍需要正确的设置HitFlag才可让碰撞生效。

| 名 | 指定位 | 描述 |
| - | - | - |
| HitFlag.Enemy | 0b0000001 | 互为敌队的itr与bdy的hit_flag指定位同时为1时，才可能产生碰撞 |
| HitFlag.Ally | 0b0000010 | 互为同队的itr与bdy的hit_flag指定位同时为1时，才可能产生碰撞 |
| HitFlag.Entity | 0b0000100 | 能否与“其他（如人质）”产生碰撞（itr或bdy任一的hitflag指定位为1存在即可） |
| HitFlag.Fighter | 0b0001000 | 能否与角色产生碰撞（itr或bdy任一的hitflag指定位为1存在即可） |
| HitFlag.Weapon | 0b0010000 | 能否与武器产生碰撞（itr或bdy任一的hitflag指定位为1存在即可） |
| HitFlag.Ball | 0b0100000 | 能否与气功波产生碰撞（itr或bdy任一的hitflag指定位为1存在即可） |

- 例1：
  - 当角色itr想要击中敌方气功波bdy，应有如下：
    - itr.hit_flag = 0b0000001 | 0b0100000
    - bdy.hit_flag = 0b0000001
  - 或
    - itr.hit_flag = 0b0000001
    - bdy.hit_flag = 0b0000001 | 0b0100000
