# 碰撞测试表达式

为了日后实现更多的碰撞判定……为了避免过于“hard-code”，
LF2Wemake引入了“碰撞测试表达式”，
很多碰撞判定实现是通过此功能实现的。

- 例：
  - 气功波被摧毁（配合hitflag,看起来长到有点头痛...）：
    `bdy.test = "(same_team==0&attacker_type==8&itr_kind==0&itr_effect!=3&itr_effect!=20)|(same_team==1&attacker_type==8&same_facing==0&itr_kind==0&itr_effect!=3)|itr_kind==9|(same_team==1&same_facing==0&itr_kind==5)|(same_team==0&itr_kind==5)&(itr_kind!=14&itr_kind!=10&itr_kind!=11&itr_kind!=2&itr_kind!=7)&(itr_effect!=30&itr_effect!=20)"`
  - 气功波被反弹（配合hitflag）：
      `bdy.test = "itr_kind!=9&itr_kind!=14&(attacker_type==32|(attacker_type==16&itr_kind!=5))&(itr_kind!=14&itr_kind!=10&itr_kind!=11&itr_kind!=2&itr_kind!=7)&(itr_effect!=30&itr_effect!=20)"`
  - 角色拾取武器（配合hitflag）：
    `itr.test = "attacker_has_holder==0&victim_has_holder==0&(victim_state==1004|victim_state==2004)"`

其中“或”与“非”的优先级是同级的（与一般编程语言不一致），你需要自己加括号来决定其运行顺序。

TODO: 更细致的说明，这恐怕量有点大
