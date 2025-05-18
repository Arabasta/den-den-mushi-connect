const express = require('express');
const {createServer} = require('http');
const {WebSocketServer} = require('ws');
const pty = require('node-pty');
const os = require("node:os");
const {join} = require("node:path");

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({server});

app.use(express.static('public'));

const shellType = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

function getCertFromVault() {
    return join(__dirname, 'your.pem');
}

wss.on('connection', (ws) => {
    console.log('New terminal connection');

    const privateKeyPath = getCertFromVault();
    const targetHost = "yourhost";
    const targetUser = "ec2-user";
    const targetPort = "22";

    const shell = pty.spawn('ssh',
        [
            '-i', privateKeyPath,
            '-p', targetPort,
            `${targetUser}@${targetHost}`,
            ],
            {
                name: 'xterm-color',
                cols: 80,
                rows: 30,
                cwd: process.env.HOME,
                env: {
                    ...process.env,
                    TERM: 'xterm-256color',
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
