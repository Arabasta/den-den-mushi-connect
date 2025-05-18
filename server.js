const express = require('express');
const {createServer} = require('http');
const {WebSocketServer} = require('ws');
const pty = require('node-pty');
const os = require("node:os");

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({server});

app.use(express.static('public'));

const shellType = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

wss.on('connection', (ws) => {
        console.log('New terminal connection');

        const shell = pty.spawn(shellType, [],
            {
                name: 'xterm-color',
                cols: 80,
                rows: 30,
                cwd: process.env.HOME,
                env: {
                    ...process.env,
                    TERM: 'xterm-256color',
                    //PROMPT_COMMAND: 'stty -echo >/dev/null 2>&1', // disable echoing input
                },
            }
        );

        // forward output to client
        shell.on('data', (data) => {
            ws.send(data.toString());
        });

        // handle client input
        ws.on('message', (data) => {
            shell.write(data);
        });

        const cleanup = (code, reason) => {
            shell.kill();
            if (ws.readyState === ws.OPEN) {
                ws.close(code, reason);
            }
        };

        ws.on('close', () => cleanup(1000, 'Normal closure'));
        shell.on('exit', () => cleanup(1001, 'Shell terminated'));
    }
);

// start server
const PORT = 45005;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
