# 角色

## 头部信息

打开一个角色的dat文件（此处以davis.dat为例），文件头部可见如下信息

```plaintext
<bmp_begin>
name: Davis
head: sprite\sys\davis_f.bmp
small: sprite\sys\davis_s.bmp
file(0-69): sprite\sys\davis_0.bmp  w: 79  h: 79  row: 10  col: 7
file(70-139): sprite\sys\davis_1.bmp  w: 79  h: 79  row: 10  col: 7
file(140-209): sprite\sys\davis_2.bmp  w: 79  h: 79  row: 10  col: 7
walking_frame_rate 3
walking_speed 5.000000
walking_speedz 2.500000
running_frame_rate 3
running_speed 10.000000
running_speedz 1.600000
heavy_walking_speed 3.700000
heavy_walking_speedz 1.850000
heavy_running_speed 6.200000
heavy_running_speedz 1.000000
jump_height -16.299999
jump_distance 10.000000
jump_distancez 3.750000
dash_height -10.000000
dash_distance 18.000000
dash_distancez 5.000000
rowing_height -2.000000
rowing_distance 5.000000
<bmp_end>
```

| -                    | 说明                   |
| -------------------- | ---------------------- |
| name                 | 角色名称               |
| walking_frame_rate   | 走路的动作变换的时间   |
| walking_speed        | 走路速度               |
| walking_speedz       | 走路的z(按↑↓时)速度  |
| running_frame_rate   | 跑步的动作变换的时间   |
| running_speed        | 跑步速度               |
| running_speedz       | 跑步z速度              |
| heavy_walking_speed  | 搬重物时走路的速度     |
| heavy_walking_speedz | 搬重物时走路的z速度    |
| heavy_running_speed  | 搬重物时跑步的速度     |
| heavy_running_speedz | 搬重物时跑步的z速度    |
| jump_height          | 跳的高度(负值)         |
| jump_distance        | 前跳的速度             |
| jump_distancez       | z方向跳的速度          |
| dash_height          | 跑跳的高度(负值)       |
| dash_distance        | 跑跳的速度             |
| dash_distancez       | 跑跳的z速度            |
| rowing_height        | 受身时向上的高度(负值) |
| rowing_distance      | 受身时向后的速度       |

## frame

`<FRAME>`## standing

`<FRAME>`架构，每一个动作的变化都必须使用一个frame，结束用<FRAME_END>
人物基本的动作就快花掉150个frame以上所以非常多

## 为这动作所编的号码，就是所谓的act

在这基本动作中，此号码最好不要乱改，因关系到动作的进行
standing 动作名称，在改档时分辨用的

- 每个frame彼此用hit或next连结在一起，达到进行动作的效果
  act号码，有：
  0 standing站立 5 walking走路 9 running跑步 60,65 punch攻击 70 super_punch强力攻击 80 jump_attack跳攻击
  85 run_attack跑攻击 102 rowing滚 110 defend防御 120 catching抓人 180,186 falling跌倒 210 jump跳
  218 stop_running停止跑步 220 injured受伤 230 lying躺，等等很多因动作不是用hit连的，而是用state和type(控制act)连的。

pic: # state: # wait: # next: # dvx: # dvy: # dvz: # centerx: # centery: # hit_XX: # mp: # sound:

pic: 图片，数字取决自上面的file(0-69): XXX.bmp w: # h: # row: # col: #
由左上第一个以0开始
state: 动作的状态，会影响人物当时的状态
wait: 动作停留时间，注意:hit连的和state连的会比next连的少一格时间(state:连的按键可留4格时间)
next: 下一个动作act号码
dvx: 横向x方向的速度
dvy: 上下y方向的加速度- 正值是向下，负值是向上，wait越久加得越快
dvz: 与地面z方向的速度- 玩时要按↑↓才会动
移动的距离=dvx\*wait，dvx动作结束后，还会移动一段距离才停止(=煞车)
centerx: x位置中心
centery: y位置中心，对于图片来说，相当于影子的位置，由图片左上角算起，x向右，y向下算

- 所以说很多xy的计算都是以图片为准
  hit_a: hit_d: hit_j: 指在该动作时按下A攻击D防御J跳跃，会跳到act号码所在的动作
  hit_Fa: hit_Ua: hit_Da: hit_Fj: hit_Uj: hit_Dj: hit_ja: 按时要先加防御D再…，如hit_Fa是防前攻
  F前 U上 D下 j跳 a攻
  mp: 气用量
  sound: 声音

## 角色act的分布

| act       | name               | desc                                                                                      |
| --------- | ------------------ | ----------------------------------------------------------------------------------------- |
| 0 ~ 3     | standing           | 站立                                                                                      |
| 5 ~ 8     | walking            | 行走                                                                                      |
| 9 ~ 11    | running            | 跑步                                                                                      |
| 12 ~ 15   | heavy_obj_walk     | 拿重物时走路，停下时维持当前frame                                                         |
| 16 ~ 18   | heavy_obj_run      | 拿重物时跑步                                                                              |
| 19        | heavy_stop_run     | 拿重物时煞车                                                                              |
| 20 ~ 23   | normal_weapon_atck | 拿轻物时攻击                                                                              |
| 25 ~ 28   | normal_weapon_atck | 同前，分成两个动作                                                                        |
| 30 ~ 33   | jump_weapon_atck   | 拿轻物时跳攻击                                                                            |
| 35 ~ 37   | run_weapon_atck    | 拿轻物时跑攻击                                                                            |
| 40 ~ 43   | dash_weapon_atck   | 拿轻物时跑跳攻击                                                                          |
| 45 ~ 47   | light_weapon_thw   | 丢出轻物                                                                                  |
| 50 ~ 51   | heavy_weapon_thw   | 丢出重物                                                                                  |
| 52 ~ 54   | sky_lgt_wp_thw     | 跳时丢出轻物                                                                              |
| 55 ~ 58   | weapon_drink       | 喝可以喝的道具                                                                            |
| 60 ~ 62   | punch              | 普通攻击                                                                                  |
| 65 ~ 67   | punch              | 同前，分成两个动作                                                                        |
| 70 ~ 75   | super_punch        | 重击                                                                                      |
| 80 ~ 81   | jump_attack        | 跳攻击                                                                                    |
| 85 ~ 87   | run_attack         | 跑攻击                                                                                    |
| 90 ~ 91   | dash_attack        | 跑跳攻击                                                                                  |
| 94        |                    | 与state：100配合，只有一部分人有用。                                                      |
| 95        | dash_defend        | 跑跳防御 ←有这个动作吗？？？                                                             |
| 100 ~ 101 | rowing             | 向后授身                                                                                  |
| 103 ~ 107 | rowing             | 回避、滚地                                                                                |
| 108 ~ 109 | rowing             | 向前授身                                                                                  |
| 110       | defend             | 防御                                                                                      |
| 111       | defend             | 防御时被打到                                                                              |
| 112 ~ 114 | broken_defend      | 破挡，即档不住时的动作                                                                    |
| 115 ~ 116 | picking_light      | 捡起轻物                                                                                  |
| 117       | picking_heavy      | 捡起重物                                                                                  |
| 120 ~ 123 | catching           | 捉住人时的动作<br />配合itr: kind:1 catchingact: xxx                                     |
| 122 ~ 123 | catching           | 捉打<br />frame:121中的cpoint: aaction: 122                                               |
| 130 ~ 144 | picked_caught      | 被捉，其中有一些是被捉时被打的动作<br />每人必须相同<br />配合itr: kind:1 caughtact: xxx |
| 180 ~ 185 | falling            | 向前跌倒                                                                                  |
| 186 ~ 191 | falling            | 向后跌倒                                                                                  |
| 200 ~ 202 | ice                | 被冰封                                                                                    |
| 203 ~ 206 | fire               | 被火烧                                                                                    |
| 207       | tired              | 累，但不是晕眩 ←有这个动作吗？？？                                                       |
| 210 ~ 212 | jump               | 跳跃                                                                                      |
| 213       | dash               | 冲跳                                                                                      |
| 214       | dash               | 倒冲跳                                                                                    |
| 215       | crouch             | 落地蹲，state：4、6刚落地的动作，按d滚动，按j冲跳                                         |
| 218       | stop_running       | 煞车                                                                                      |
| 219       | crouch2            | 起身、落地蹲                                                                              |
| 220 ~ 221 | injured            | 被打                                                                        |
| 222 ~ 223 | injured            | 被打                                                                        |
| 224 ~ 225 | injured            | 被打                                                                                |
| 226 ~ 229 | injured            | 晕眩                                                                                      |
| 230       | lying              | 躺着的倒地，死亡时会自动不断的重复此动作                                                  |
| 231       | lying              | 趴着的倒地，死亡时会自动不断的重复此动作                                                  |
| 232 ~ 234 | throw_lying_man    | 摔出被捉住的人                                                                            |
| 399       | dummy              | 角色模型 ←不可删除，且为角色frame数的上限                                                |

，可以随便改，具体是将walking中

  itr:

  kind:1 x: ? y: ? w: ? h: ? vrest: ?

  catchingact:xxx caughtact:130

  itr_end:

  的catchingact改为别的。

※235~398之间的frame就是绝技的动作，是可以任意命名及改变的。
※有些frame的数量因人而异，例如Bandit的punch是60~61 & 65~66，但Davis是
60~63 & 65~68。

## frame.state

### frame.state: 0 standing 站立(按键自由)

### frame.state: 1 walking 走路(按键自由)

### frame.state: 2 running 跑步

### frame.state: 3 running 攻击性动作

### frame.state: 4 jump 跳()

- 左右控制控制朝向
- 落地act215

### frame.state: 4 dash 冲跳

左右转

### frame.state: 4 rowing 受身、滚动

落地act215

### frame.state: 7 defend 防御

一般只能防御来自前方的攻击
被itr kind：0打到时，会按照相应的bdefend数值扣到60时act112。

### frame.state: 8 defend 破防

| 值   | 一般frame名       | 说明                                                                                                                                                                                                       |
| ---- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9    | catching          | 抓人:只有用这个state配合cpoint才能使injury有效。                                                                                                                                                           |
| 10   | picked_caught     | 被捉(武器掉落)                                                                                                                                                                                             |
| 11   | injured           | 受伤                                                                                                                                                                                                       |
| 12   | falling           | 跌倒(武器掉落，着地倒，被fall大于60打到)                                                                                                                                                                   |
| 13   | ice               | 结冻(被同盟攻击，着地倒并会扣10hp，打一下就倒，连结其他state会跑出冰碎片).<br />因为state:13可被同盟攻击，所以louis要抓结冻的同盟是可能的<br />被itr kind：0打到或落地会提前跳到next（无论wait数值）<br /> |
| 14   | lying             | 躺(com会远离你)<br />气功波hit_Fa以及state：400、401对你无效。<br />另外，刚结束此frame后会有为时一秒的一闪一闪的无敌效果。                                                                                |
| 15   |                   | 普通动作                                                                                                                                                                                                   |
| 16   | injured           | 受伤(会被itr的kind:1 捉起来)                                                                                                                                                                               |
| 17   | weapon_drink      | 喝(消耗id: 122,123的牛奶和酒的hp)                                                                                                                                                                          |
| 18   | fire              | 火攻击<br />- 可攻击同盟，id:211的例外<br />- 不会被itr.effect: 20 21烧到<br />- 不会被frame.state:19 + itr.effect:2 烧到<br />- 冒火苗（x=centerx，y=centery）wait:0则不会冒火                           |
| 19   | burn_run          | 烈火焚身(effect:20, 21烧不到之，冒火苗，和z方向移动)<br />- 不会被itr.effect: 20 21烧到<br />- 冒火苗（x=centerx，y=centery）wait:0则不会冒火                                                              |
| 100  |                   | 落雷霸(着地act94)                                                                                                                                                                                          |
| 301  |                   | 鬼哭斩(z方向移动)                                                                                                                                                                                          |
| 400  |                   | 瞬移到最近敌人，敌人在120的位置                                                                                                                                                                            |
| 401  |                   | 瞬移到最远同盟，同盟在60的位置                                                                                                                                                                             |
| 500  | transform         | 若没变过身，act跳至0                                                                                                                                                                                       |
| 501  | transform         | 变成之前变身过的人                                                                                                                                                                                         |
| 1000 |                   | 轻型武器在空中(light weapon-in the sky)                                                                                                                                                                    |
| 1001 |                   | 轻型武器在手中(on hand)，类似arest:1                                                                                                                                                                       |
| 1002 |                   | 轻型武器被投掷(throwing)，重力变弱，打到人act5,10,15                                                                                                                                                       |
| 1003 |                   | 轻型武器反弹(rebounding)                                                                                                                                                                                   |
| 1004 |                   | 轻型武器在地上(on ground)，与itr kind2作用                                                                                                                                                                 |
| 2000 |                   | 重型武器在空中(heavy weapon-in the sky))                                                                                                                                                                   |
| 2001 |                   | 重型武器在手中                                                                                                                                                                                             |
| 2002 |                   | 重型武器在地上                                                                                                                                                                                             |
| 2004 |                   | 与itr kind2作用                                                                                                                                                                                            |
| 1700 | healself          | 回hp加快                                                                                                                                                                                                   |
| 3000 | ball-flying       | "波"的飞行(ball-flying，波是指气功波)，打到人和自己的武器会跳到act10，打到别人的武器跳到act20                                                                                                              |
| 3001 | ball-hiting       | "波"打中敌时的爆破(hiting)，打到人和自己的武器不消失，正面打到别人的武器act20。                                                                                                                            |
| 3002 | ball-hit          | 波被取消，即被其他东西打中阻挡而爆破(hit)，打到人和自已的武器不消失，打到别人type1的武器act20。                                                                                                            |
| 3003 | ball-rebounding   | 波的反弹及爆破(rebounding)，打到人和type2的武器不消失，打到别人的武器act20。                                                                                                                               |
| 3004 | ball-disappear    | 波消失(disappear)，打到人和type2.4.6的武器不消失，打到type1的武器act20。                                                                                                                                   |
| 3005 | henry wind-flying | "拳气"的飞行(henry wind-flying)，打到东西不消失，打到state3005的act20，无法上下移动，没有影子。                                                                                                            |
| 3006 | ball-flying       | 属穿心攻击的波(flying)，打到东西不消失，打到state3005.3006的act20。                                                                                                                                        |
| 9995 |                   | 变成id：50的角色。                                                                                                                                                                                         |
| 9996 |                   | 造出id: 217,218 louis_armour                                                                                                                                                                               |
| 9997 | etc               | 没有影子，图片在何地都会看见                                                                                                                                                                               |
| 9998 |                   | 消失                                                                                                                                                                                                       |
| 9999 | broken_weapon     |                                                                                                                                                                                                            |
| 80## |                   | 变身成id:##的人物但图片是用第3个和第4个的                                                                                                                                                                  |

- itr.effect: 20, 21烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）
- 可攻击同盟，id:211的例外
- itr.effect: 20, 21烧不到之
- frame.state:19 + itr.effect:2 烧不到之
- 冒火苗（x=centerx，y=centery）

## frame.dvx|dvy|dvz

dvx，y，z都是速度而不是距离。距离=wait*dvx/y/z（单位：dvx:1*wait:0=1象素）。
dvz：按上或下才会上下移动的。
dvx/y/z：0，人物会受惯性或重力作用。
dvx、z：550，人物不受惯性作用。
dvy：550，人物不受重力和惯性作用。

## frame.next

| 值          | 描述                                        |
| ----------- | ------------------------------------------- |
| 0           | 原动作，此动作若有mp但不消耗                |
| 原act码     | 原动作，此动作若有mp: -#会消耗              |
| 999         | 回到act: 0，角色在空中则会回到act:212       |
| 1000        | 移除物件                                    |
| 1100 ~ 1299 | 与999等效，但会隐身，数值越大，隐形时间越长 |
| -#          | 下一个动作会转向                            |
| 无对应act   | 与999等效                                   |

## frame.mp

- 用hit进入此动作时:
  - +# 耗mp
  - -# 补mp
- 用next进入此动作:
  - +# 不耗mp
  - -# 耗mp

数字大于1000时会耗hp，4300=40hp+300mp

- 在进入此动作前按←，会跳至hit_d:的动作(但hit_d:999，mp耗完时人物会被移除)

## itr与bdy

- itr只会和bdy产生作用。
- itr攻击人后自己动作会停3格，被打的也停3格时间。

```txt
itr:(攻击开始指令)
kind: # x: # y: # w: # h: # vrest: # arest: # dvx: # dvy: # fall: # bdefend: # injury: #
effect: # zwidth: # 另外要依kind而使用的是catchingact: # caughtact: #
itr_end:(攻击结束指令)
```

kind: 攻击的方式或使敌人进入某状态
x: x座标
y: y座标，以图片左上角为原点，x向右，y向下算起在哪座标
w: x横向向右围起来的范围
h: y纵向向下围起来的范围

- 由wh组成一个四方形的面积，由xy决定此四方形的位置。
  vrest: 一有这指令就能在攻击范围内打击多个敌人，而数字是敌人多久被你打一次
- 值不能小于4，否则动作不能进行
  arest: (vrest无效)一攻击到一个人，多久后才能再打一个人
- 最小值是4
  dvx: 敌人被打后向后速度弹多少
  dvy: 敌人被打后向下速度弹多少(用负值才会向上弹)
  fall: 敌人被打而会跌倒的程度(持续攻击会累加)
  bdefend: 敌人防御时被打而会破防的程度(持续攻击会累加)
  injury: 攻击力
  effect: 效果，(在kind:0时使用)
  zwidth: z方向上下的范围
  catchingact: 抓到敌人后自已的动作跳到act码
  caughtact: 敌人被捉后动作跳到act码(130 ~ 144之间，除非有另外设计)

### itr

#### itr.kind

##### itr.kind：0  拳击(或配合effect效果)

##### itr.kind：1  抓state:16的人(要配合catchingact和caughtact)

##### itr.kind：2  捡武器(type:1,2,4,6，state:1004,2004且有bdy的才被能捡)

##### itr.kind：3  强迫抓人(配合catchingact和caughtact)

##### itr.kind：4  在falling动作有(被用cpoint丢出才有攻击力)

##### itr.kind：5  在武器的on_hand有(用人物wpoint的attacking来决定entry，攻击力在entry决定

##### itr.kind：6  敌人在此范围内按攻击会至super_punch(act70)的动作

##### itr.kind：7  捡武器不影响动作(只能捡轻武器)

##### itr.kind：8  治疗(可对同盟的bdy起作用，injury变成补多少hp，动作至dvx的动作码)

##### itr.kind：9  打到人，自己的hp→0(打到气功，气功不失血)

##### itr.kind：10 henry死亡之乐章效果

##### itr.kind：11 无

##### itr.kind：14 阻挡(在此范围不能移动)

##### itr.kind：15 飞起来(freeze白色龙卷效果)

##### itr.kind：16 结冻(freeze白色龙卷效果)

#### itr.fall

1 敌人被打很多下都不晕(但只限被同一个物件攻击)
10 ~ 20 敌人被打三下就晕
25 敌人被打二下晕
60 一下就晕
70 跌倒

- 负值：不会影响敌人动作，但可扣敌人血(负越多，反而使该角色被打时不跌倒)

#### itr.bdefend

跟fall相似…

- 100是破防+摧毁武器

#### itr.effect

| 值 | 描述                                            |
| -- | ----------------------------------------------- |
| 0  | 拳击                                            |
| 1  | 利器(会流血)                                    |
| 2  | 着火                                            |
| 20 | 着火，打不到气功，打不到state18, 19             |
| 21 | 着火，打不到state18, 19                         |
| 22 | 着火(左右的攻击方向是向内，所以dvx用负的是向外) |
| 23 | 只有左右的攻击方向向内                          |
| 3  | 结冰                                            |
| 30 | 结冰，打不到state:13                            |
| 4  | 打不到人(type: 1,2,3,4,5,6会被打到)             |

- 着火时会定身，因为fall值小于60
- 其他数值与effect: 0一样

### bdy

bdy:(身体指令开始)
kind: # x: # y: # w: # h: #
bdy_end:(身体指令结束)

kind: #
10##，##是被打后跳到的act(只有id:300 才有效用)
x: y: w: h: 同上使用方式，body的范围

#### bdy.kind

#### bdy.kind: 0 普通

#### bdy.kind: 1XXX 被打跳转

被打到跳到frameXXX，仅id：300有效。

必须被人物、id：210、202的武器所有itr kind：0打到才有效。

#### bdy 其他说明

〈特别发现〉无敌。
人物无敌可用bdy y：-10000。（有的招利用itr y：-10000造成打无敌的特效）
气功波无敌要删除bdy。
场地边缘无限高度会阻挡人物bdy。如果人物用bdy y：-10000，则不会跑到场外；如果人物删除bdy，就会跑到场外。

### cpoint

cpoint:(抓人指令开始)
kind: # x: # y: # cover: # vaction: # aaction: # taction: #
injury: # hurtable: # decrease: # throwvx: # throwvy: # throwvz: # throwinjury: #
另外有fronthurtact: # backhurtact: # dircontrol: #
cpoint_end:(抓人指令结束)

kind: 抓人状态，1是抓人，2是被抓的(必须配合，1抓2的，否则抓不起来)
x: x座标，与被抓的x座标配合
y: y座标，与被抓的y座标配合
cover: 遮盖(10被抓者在后，11被抓者在前)
vaction: 敌人的act
aaction: 按A时自己跳到的act
taction: 按→A时自己跳到的act
injury: 被抓的敌人受伤量(正值是受伤+停格，负值是受伤不停格)
hurtable: 敌人会不会被人打到？(0不会，1会)- 但vaction:在133 ~ 144的敌人不会被打到
decrease: (负值)抓住的时间减少值(总抓住的时间值301/#=抓住的时间)
throwvx: 丢出去的x速度
throwvy: 丢出去的y速度
throwvz: 丢出去的z速度(要按↑↓才会丢斜的)
throwinjury: 被丢者的受伤量

- -842150451不知是什么…
  fronthurtact: (正面被打后的act)
  backhurtact: (背面被打后的act)
  dircontrol: 控制方向(按着→进入此动作会向右转，负数则会相反)

hurtable完全说明
0 抓在手上的敌人不会被他人打到，且当被捉者不在手上时(丢掉)，动作持续进行。
1 抓在手上的敌人会被他人打到，累积fall超过60就会脱手，当被捉者不在手上时，动作到act0。

throwinjury完全说明

- throwvx: 不能为0，而throwinjury值也不能在-2以下，否则自己会消失。
  -1 变成被抓者的id(样子)，之后可按DJA变回来，若想再变回去请用state: 501。
  可惜的是变成henry你不能用五连矢…(会变回来)

### bpoint

```text
bpoint:
x: # y: #
bpoint_end:
```

- hp少于1/3时，嘴角流血。

#### bpoint.x 流血位置X坐标

#### bpoint.y 流血位置Y坐标

## Ball

对于hit_a，hit_d，hit_j，hit_Fa，state的说明

weapon_hit_sound: 撞到的声音
weapon_drop_sound: 撞到地上的声音
weapon_broken_sound: 毁掉的声音

此气功的center是与opoint的xy配合的。
在一连续循环的动作中使用hit_a来计算时间结束，动作跳至hit_d

hit_a: 每一格时间气功扣血量(hp500/hit_a=持续时间)(由于hit_a是扣气功的hp来算的，故你按F7时气功的hp也会全满)
hit_d: 当气功hp扣完时动作跳到此
hit_j: z方向移动速度，50为中间，49以下是上移的速度，51以上是下移的速度
hit_Fa: 追纵的程度…

- hit_Fa: 2,12,14当hp扣完时，就会失去效用
- 武器也适用

hit_Fa完全说明
1 追敌人的center(因为敌人站在地面，所以会下飘)
2 dennis_chase(追纵效果)
3 加速法追敌(追纵力较差)(敌人倒地后转移攻击目标)
4 jan_chaseh(用了会故障，必须改用5)
5 天使赐福
6 恶魔的审判
7 jan_chase,firzen_chasef,firzen_chasei(用了会故障，必须改用6,9)
8 吸血蝙蝠
9 殃殒天降
10 john_biscuit加速??(从慢变快)
11 极地火山
12 bat_chase(追纵效果)
13 连环重炮
14 连环重炮(追纵效果)

john_biscuit说明
由于id: 214和state: 3006的关系，打到人后会跳到hit_d

dennis_chase说明
由于hit_Fa: 2的关系，转向时act: 1，追人时act: 3，飞走时(hp扣完)act: 5

julian_ball说明
由于hit_Fa: 14的关系，转向时act: 50，追人时act: 0
转向时act: 51，追人时act: 1
转向时act: 52，追人时act: 2
......
(转向共有50 ~ 59，追人共有0 ~ 9，依此类推)

气功act分布
10 hitting
20 hit
30 rebounding
40 disappearing

type3的说明
打到东西act10
被气功打到act20
被type0人物打到act30(itr:kind:0的effect 2除外)
state: 3\3005\3006 打到人不会act10
state: 3005\3006 打到气功不会act10

| 攻 \ 受        | ball, state 3000  | character  | weapon     |
| ---------------- | ----------------- | ---------- | ---------- |
| ball, state 3000 | act 10 \ act 20 | act 10 \ - | act 10 \ - |
| character        | - \ act 30       |            |            |

## Weapon

这次对于武器的entry和state说明

type:1,4,6的轻型武器

weapon_hp: 武器的hp量
weapon_drop_hurt: 武器着地的损血量
weapon_hit_sound: 被打到的声音
weapon_drop_sound: 着地的声音
weapon_broken_sound: 毁坏的声音

<WEAPON_STRENGTH_LIST>(武器攻击表开始)
entry: 1 normal
...
entry: 2 jump
...
entry: 3 run
...
entry: 4 dash
...
<WEAPON_STRENGTH_LIST_END>(武器攻击表结束)

在人物的wpoint的attacking使用哪个数字，就会用该entry的攻击方式

- 可以自己新增entry: 5以上的数字，不过人物的attacking就要用5以上

act的分布
0 in_the_sky
20 on_hand
40 throwing
60 on_ground
70 just_on_ground

state说明
1002 打到东西 dvx: -1，dvy:-1，act0 ~ 15随机
1004 会被itr: kind: 7拾起来，只会被气功类打到，Com只会在此物件的center按攻击

type: 2重型武器

act分布
0 in_the_sky
10 on_hand
20 on_ground

## Background

第六篇===地图

修改的位置：bg\sys\任一资料夹\bg.dat

name: 名称(在选单时有)
width: #
地图左右的宽度
zboundary: # #
地图上下的范围(第一个数字是上限的位置，第二个数字是下限的位置)
shandow: 影子的图片
shandowsize: # #
影子的尺寸(第一个数字是左右宽度，第二个数字是上下的宽度)，它不会把图片切掉

- 人物站的位置是所定的尺寸的正中间。

layer:
(图片)…
transparency: # width: # x: # y: # loop: # cc: # c1: # c2: #
其他rect: # x: # y: # width: # height: #
layer_end

layer是有照顺序的，最后面叙述的(玩时)显示在最前面

- layer_end不能加冒号(：)

transpparency: 透明度(图片黑色部分，0不透明，1透明)
width: 794是不会动(图片在整场移动距离=#-794)
x: x座标
y: y座标，最高点110
loop: 多少距离放一个图片
cc: 多少时间循环一次
c1: 循环内出现的时间
c2: 循环内结束的时间
示意图：
????????????←╮
╰→→→→→→→→→→→→╯
c1→出现→c2 cc

rect: 色彩填满(要看你的电脑显示是用几色的)
width: 宽度(从x座标算起)
height: 高度(从y座标算起)

## data.txt

第七篇===改data.txt

对于id的特性说明

基本常识
FF
１、场地上最多物件350个，否则无法造气功(opoint)
２、喝牛奶的时间99(喝造出来的牛奶249)，喝酒的时间154(无聊找的)
３、武器掉到场外即消失(闯关右侧例外)
４、闯关的bound不能大于地图的width，否则不能过关
５、rudolf在run_weapon_attack时因act37的state是0，所以造成连挥两下
６、rudolf，因rowing的act108和109加入了hit_Fj，所以背后受身时可用刺虎

关于dat档锁码

name: 强化abc?←就会锁住了，- 不要乱用，不然以后不能修改…

特别收录重愁的破解锁码档方法：
1对该人物会用到的图片暂时改别的名子
2执行lf2程式，出现错误后关掉
3到data资料夹里开启temporary.txt，资料都在里面
4记得把图片名子改回来喔

关于state:80##变身后图片变化

变身后图片由第三个当作第一个读起
所以图片顺序改成…
pic_0
pic_1
pic_0b
pic_1b
pic_2
pic_3
pic_2b
pic_3b
...
你会发现knight的图片顺序不太对，其实在战争模式时是正常图片
===改档技术的问题===
Q1请问要怎么补血呢？
A1:
补血n种方法：
１、按F7全体的hp、mp全满。
２、喝牛奶吧。
３、叫john治疗你。
itr: kind: 8 injury: #
４、用john的治疗术。
state: 1700
５、叫jan治疗你。
６、改档，mp: -#0000回血法。
利用hit接到下一个动作，就在这个动作加入mp: -#0000
７、攻击力负值。
一，叫别人用负攻击(injury: -#)打你。
二，用opoint造出来，再用state: 18的方式来打你。

Q2怎么让角色复活？
A2:
１、让自己复活。
一，在两个lying的动作加入hit，而在下一个动作加入mp: -#0000

- 缺点：失血过多会无法复活。
  二，在两个lying的动作加入opoint和bdy，造出来的物件用state: 18且
  负攻击打你。
  ２、让别人复活。
  先在每个角色的lying中加入bdy，自己用state: 18且负攻击打他。

Q3怎么让COM使用我的角色？
A2每个主要角色的攻击和出招方式由id决定，要先注意哪个id的出招按法
(D>A,DvA,D^A,D>J,DvJ,D^J...)与你的角色大致雷同，这样电脑使用你的
角色时才会比较顺畅。

Q3data.txt读取文做什用的？
A3可以在此新增和删除角色，气功武器也是。

Q4图片怎么显示的？
A4:假设w: 79 h: 79，它读的像素从0 ~ 78，共有79像素，而在第79时
空了一行分格线，第二个图片就是从80 ~158，第三个是160 ~ 238了。
row: 10 col: 7，横向有10格图片，纵向有7格图片的意思。

Q5明明已经存好了，为什下面的指令不见了？
A5:
１、尽量使用新的改档器。
２、尽量不要重覆一直开启旧档，而是关闭后，重新双击改档器。

===执行主程式的问题===
Q1出现无法显示图片。
A1由于dat档里可能有要求指定位置没有符合名称的图片，它会先跳出一
个视窗，有显示它要求图片的路径，您再到该资料夹去看看名称是否有误
temporary.txt也可找到出问题的档案内容。
自己解决的方法：
１、新增该名子的图片。
２、用改档器把要求图片的指令删除。

- 小朋友只能用bmp的图片。

Q2改档完后执行主程式停住了。
A2可能该档案里没有结束的指令。
１、用改档器到该档案里最后面加入：<BMP_END>或<FRAME_END>

Q3选人物时突然跳出游戏。
A3:
１、可能是data.txt里的物件object太多了，请到data.txt里删除一些不
会用到的角色或气功(最好在100个以下)。
２、可能是该档案里没有head:的指令。
