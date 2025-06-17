import express from 'express';
import http from "node:http";

import {createWebSocketServer} from "../websocket/websocketServer.js";
import {handleConnection} from "../websocket/handlers/connection.js";
import {config} from "../config/config.js";
import {setupHeartbeat} from "../websocket/heartbeat/heartbeat.js";

const app = express();
app.use(express.json());

const server = http.createServer(app);

const PORT = config.server.port;
const wss = createWebSocketServer(server);

// wss.shouldHandle = (req) => {
//     const { origin } = req.headers;
//     // return req.url.startsWith('/ws');
//     return origin === 'localhost';
// };

wss.on('connection', (ws, req) => {
    handleConnection(ws, req);
});

wss.on('error', (err) => {
    console.error('WebSocket Server Error', err);
});

// setupHeartbeat(wss);

process.on('SIGINT', () => {
    console.log("SIGINT, shutting down worker");

    // not working?
    wss.clients.forEach(client => client.close(1001, "Server shutting down. Please reconnect later."));
    server.close(() => process.exit(0));
});

// should we allow clients to finish their work before shutting down?
process.on('SIGTERM', () => {
    console.log("SIGTERM, shutting down worker");
    wss.clients.forEach(client => client.close(1001, "Server shutting down. Please reconnect later."));
    server.close(() => process.exit(0));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
