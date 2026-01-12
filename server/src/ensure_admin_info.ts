import type { Client } from './Client';
import { ensure_player_info } from './ensure_player_info';
import { ErrCode } from './ErrCode';
import type { TReq } from './Net';


export function ensure_admin_info(client: Client, req: TReq) {
  if (!ensure_player_info(client, req)) return false;
  if (client.is_admin) return true;
  client.resp(req.type, req.pid, {
    code: ErrCode.NotAdmin,
    error: 'not admin!'
  }).catch(() => void 0);
  return false;
}
