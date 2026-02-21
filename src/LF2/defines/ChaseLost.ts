export enum ChaseLost {
  /* 原地徘徊 */
  Hover         /**/ = 0b00000001,
  /* 离开 */
  Leave         /**/ = 0b00000010,
  /* 放弃寻找 */
  End           /**/ = 0b00000100,
}
