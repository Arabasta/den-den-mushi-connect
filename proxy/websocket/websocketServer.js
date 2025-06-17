import {WebSocketServer} from 'ws';

// ref: https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback
export function createWebSocketServer(server) {
    return new WebSocketServer({
        server, // currently using the express server
        // port: 45005, // will create http server automatically, should we use this or just use the same port as the express server?
        autoPong: true,
        allowSynchronousEvents: true,
        backlog: 1024, // max queue size for pending connections
        clientTracking: true,
        maxPayload: 1 * 1024 * 1024, // 1 MB
        // path: '/ws', // todo: specify path for wss
        perMessageDeflate: {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            clientNoContextTakeover: true, // Defaults to negotiated value.
            serverNoContextTakeover: true, // Defaults to negotiated value.
            serverMaxWindowBits: 10, // Defaults to negotiated value.
            concurrencyLimit: 10, // Limits zlib concurrency for perf.
            threshold: 1024 // Size (in bytes) below which messages should not be compressed if context takeover is disabled.
        }
    });
};