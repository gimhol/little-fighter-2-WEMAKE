
export enum WpointKind {
  None = 0,
  Bearer = 1,
  Holded = 2,
  Drop = 3,
}
export const WP_K = WpointKind
export type WP_K = WpointKind
export const WpointKindDescriptions: Record<WpointKind, string> = {
  [WpointKind.None]: "None",
  [WpointKind.Bearer]: "Bearer",
  [WpointKind.Holded]: "Holded",
  [WpointKind.Drop]: "Drop",
}
export const wpoint_kind_name = (v: any) => WpointKind[v] ?? `unknown_${v}`;
export const wpoint_kind_full_name = (v: any) => `WpointKind.${wpoint_kind_name(v)}`

const descs: any = WpointKindDescriptions;
for (const key in descs) {
  descs[key] = descs[key] || wpoint_kind_full_name(key)
}