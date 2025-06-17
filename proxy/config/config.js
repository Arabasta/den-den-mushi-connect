import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'dev';

const sshConfPath = path.join(__dirname, 'shared', 'sshConfig.json');
const serverConfigPath = path.join(__dirname, 'shared', 'serverConfig.json');
const websocketCodesPath = path.join(__dirname, 'shared', 'websocketCodes.json');

let sshConfig = {};
let serverConfig = {};
let websocketCodes = {};

try {
    sshConfig = JSON.parse(fs.readFileSync(sshConfPath, 'utf8'));
    serverConfig = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
    websocketCodes = JSON.parse(fs.readFileSync(websocketCodesPath, 'utf8'));
} catch (err) {
    console.error(`Failed to load config for ${env}:`, err);
}

export const config = {
    ssh: sshConfig,
    deleteKeyDelay: sshConfig.connectTimeout * 1000 || 10000,
    server: serverConfig,
    websocket: websocketCodes,
};
