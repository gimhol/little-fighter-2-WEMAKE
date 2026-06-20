
export interface ICollisionSnapshot {
  readonly aid: string;
  readonly vid: string;
  readonly adata_id: string;
  readonly vdata_id: string;
  readonly aframe_id: string;
  readonly bframe_id: string;
  readonly itr_index: number;
  readonly bdy_index: number;
  readonly ax: number;
  readonly ay: number;
  readonly az: number;
  readonly vx: number;
  readonly vy: number;
  readonly vz: number;
  readonly dx: number;
  readonly dy: number;
  readonly dz: number;
  readonly m_distance: number;
  readonly rest: number;
}
