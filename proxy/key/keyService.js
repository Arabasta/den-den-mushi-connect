import {chmodSync, writeFileSync, unlinkSync} from 'fs';
import {join} from 'path';
import os from 'os';
import {config} from "../config/config.js";

const tempKeys = {};

async function getSSHKey(host, user, sessionId) {

    const fakePrivateKey = `
fakekey
`.trim();

    const keyPath = join(os.tmpdir(), `ssh-${sessionId}.pem`);
    writeFileSync(keyPath, fakePrivateKey);
    chmodSync(keyPath, 0o600);
    console.log(`SSH key written to ${keyPath}`);

    tempKeys[sessionId] = keyPath;
    return keyPath;
}

async function deleteTmpFile(sessionId) {
    try {
        await new Promise(resolve => setTimeout(resolve, config.deleteKeyDelay));
        const keyPath = tempKeys[sessionId];
        console.log(`Deleting temporary SSH key at ${keyPath}`);
        unlinkSync(keyPath);
        delete tempKeys[sessionId];
    } catch (e) {
        console.error(`Failed to delete SSH key: `, e);
    }
}

export const keyService = {
    getSSHKey,
    deleteTmpFile,

};
