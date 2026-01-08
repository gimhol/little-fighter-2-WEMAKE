import { Defines, type IBotRay } from "../../defines";
import type { Entity } from "../../entity";
import { abs, between, project_to_line, round_float } from "../../utils";

export function is_ray_hit(a: Entity, b: Entity, ray: IBotRay) {
  const p0 = a.position;
  const p1 = b.position;

  const {
    x, z,
    min_x = 0, max_x = 10000,
    min_z = 0, max_z = 10000,
    max_d = Defines.DAFUALT_QUBE_LENGTH_POW2,
    reverse = false,
  } = ray

  const dx = round_float(p1.x - p0.x);
  const dz = round_float(p1.z - p0.z);

  if (!between(a.facing * dx, min_x, max_x))
    return reverse;
  if (!between(abs(dz), min_z, max_z))
    return reverse;

  const [px, pz] = project_to_line(dx, dz, x * a.facing, z)
  const dist = (dx - px) ** 2 + (dz - pz) ** 2
  const hit = round_float(dist) < max_d
  return reverse ? !hit : hit;
}
