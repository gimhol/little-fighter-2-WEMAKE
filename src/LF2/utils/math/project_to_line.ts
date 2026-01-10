import { round_float } from "./round_float";


export function project_to_line(x: number, y: number, m: number, n: number): [number, number] {
  // 校验方向向量有效性：不能为零向量（否则不是直线）
  const d = round_float(m ** 2 + n ** 2);
  if (d === 0) throw new Error("无效直线：方向向量不能为零向量");
  
  const t = ((x - 0) * m + (y - 0) * n) / d;
  return [
    round_float(t * m), 
    round_float(t * n)
  ];
}

