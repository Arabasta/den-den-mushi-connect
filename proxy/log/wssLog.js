export function ws_log(req) {
    console.log('New WebSocket connection');
    console.log(`WebSocket request URL: ${req.url}`);
    console.log(`WebSocket request headers:`, req.headers);
    console.log(`WebSocket request body: ${req.body}`);
    console.log(`WebSocket request method: ${req.method}`);
}