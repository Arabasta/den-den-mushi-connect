
export function setupHeartbeat(wss, {
    intervalMs = 30000,
    timeoutMs = 10000,
    onDeadClient = (ws) => ws.terminate()
} = {}) {
    wss.on('connection', (ws, req) => {
        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
            ws.lastPong = Date.now();
        });

        ws.on('close', () => {
            clearInterval(ws._heartbeatInterval);
        });

        // Optional: attach last seen time
        ws.lastPong = Date.now();
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false || (Date.now() - ws.lastPong > timeoutMs)) {
                console.warn('Dead WebSocket detected. Terminating.');
                onDeadClient(ws);
                return;
            }

            ws.isAlive = false;
            try {
                ws.ping(); // triggers a pong() on the client
            } catch (err) {
                console.error('Failed to ping WebSocket:', err);
                ws.terminate();
            }
        });
    }, intervalMs);

    wss._heartbeatInterval = interval;

    wss.on('close', () => clearInterval(interval));
}
