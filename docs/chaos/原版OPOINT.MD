# 原版OPOINT 创建物品

opoint:
kind: # x: # y: # action: # dvx: # dvy: # oid: # facing: #
opoint_end:

## 字段描述

| name   | desc                                                       |
| ------ | ---------------------------------------------------------- |
| kind   | 1=掉落; 2=拿在手上                                         |
| x      | 生成位置x座标 (图片左上角为原点)                           |
| y      | 生成位置y座标 (图片左上角为原点)                           |
| dvx    | 物品x速度                                                  |
| dvy    | 物品y速度                                                  |
| act    | 物品的frame ID                                             |
| oid    | 物件的ID，参见data.txt                                     |
| facing | 数量和方向，十位数以上为数量，个位数为方向：0正向，1反向。 |

## 注意事项

- 按键进入的第一个frame无法创建物品。
