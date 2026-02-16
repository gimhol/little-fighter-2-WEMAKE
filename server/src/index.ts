import http from "http";
import https from "https";
import { WebSocketServer } from 'ws';
import { Client } from './Client.js';
import { ClientMgr } from './ClientMgr.js';
import { Context } from './Context.js';
import { RoomMgr } from './RoomMgr.js';
import "./init.js";
import { read_file } from "./read_file.js";
import arg from "../node_modules/arg"
import info from "../package.json"

const args = arg({
  '--help': Boolean, '-h': '--help',
  '--port': Number, '-p': '--port',
  '--ssl-key-path': String,
  '--ssl-cer-parh': String,
})
function handle_help() {
  console.log(`
Little Fighter Wemake Multiplayer Server v${info.version}
Options:
  -h, --help
  -p, --port
  --ssl-key-path 
  --ssl-cer-parh

Environment variables (.env is supported):
  HTTPS_PORT
  HTTP_PORT
  SSL_KEY_FILE_PATH
  SSL_CER_FILE_PATH
`.trim())
}
async function main() {
  if (args[`--help`]) {
    handle_help();
    return;
  }
  console.log(`Little Fighter Wemake Multiplayer Server v${info.version}`)
  const ssl_key = (args['--ssl-key-path'] as string) || await read_file(process.env.SSL_KEY_FILE_PATH);
  const ssl_cer = (args['--ssl-cer-parh'] as string) || await read_file(process.env.SSL_CER_FILE_PATH);
  const https_port = (args['--port'] as Number) || Number(process.env.HTTPS_PORT) || 443
  const http_port = (args['--port'] as Number) || Number(process.env.HTTP_PORT) || 80
  const is_https = ssl_key && ssl_cer;
  const port = is_https ? https_port : http_port;
  const server = !is_https ? http.createServer() : https.createServer({
    key: ssl_key,
    cert: ssl_cer,
  })

  const wss = new WebSocketServer({ server });
  const ctx = new Context(
    wss,
    new RoomMgr(),
    new ClientMgr(),
  );
  wss.on('connection', (ws, req) => new Client(ctx, ws, req));
  wss.on('error', e => console.error('WebSocket error:', e));
  server.listen(port)
  console.log(`${is_https ? 'wss' : 'ws'} server start, port: ${port}`);
}
main();