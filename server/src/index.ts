import http from "http";
import https from "https";
import { WebSocketServer } from 'ws';
import { Client } from './Client.js';
import { ClientMgr } from './ClientMgr.js';
import { Context } from './Context.js';
import { RoomMgr } from './RoomMgr.js';
import "./init.js";
import { read_file } from "./read_file.js";
async function main() {
  const ssl_key = await read_file(process.env.SSL_KEY_FILE_PATH);
  const ssl_cer = await read_file(process.env.SSL_CER_FILE_PATH);
  const https_port = Number(process.env.HTTPS_PORT) || 443
  const http_port = Number(process.env.HTTP_PORT) || 80
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