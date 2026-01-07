import type { Client } from './Client';
import { ensure_in_room } from './ensure_in_room';
import { ensure_player_info } from './ensure_player_info';
import { IReqTick } from './IMsg_Tick';

export function handle_req_tick(client: Client, req: IReqTick): void {
  const { room } = client;
  if (!ensure_player_info(client, req)) return;
  if (!ensure_in_room(client, req)) return;
  if (!room) return;
  if (req.cmds?.length || req.events?.length) console.debug(`[handle_req_tick] req: `, req)
  room.tick(client, req)
}
