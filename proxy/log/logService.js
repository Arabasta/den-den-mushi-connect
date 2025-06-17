import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logStreams = new Map(); // sessionId, fs.WriteStream

function initLogStream(sessionId) {
    const logDir = path.join(__dirname, 'logs');

    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    } catch (err) {
        if (err.code !== 'EEXIST') {
            console.error('Failed to create log dir:', err);
            throw err;
        }
        console.error('Log stream already exists:', logDir);
        return logStreams.get(sessionId); // return exising or should we end session?
    }

    const logPath = path.join(logDir, `session-${sessionId}.log`);
    const stream = fs.createWriteStream(logPath, { flags: 'a' });

    logStreams.set(sessionId, stream);
    return stream;
}

function writeRaw(sessionId, prefix, buffer) {
    const stream = logStreams.get(sessionId) || initLogStream(sessionId);
    const timestamp = new Date().toISOString();
    stream.write(`[${timestamp}] [${prefix}] `);
    stream.write(buffer);
    stream.write('\n');
}

function closeLog(sessionId) {
    const stream = logStreams.get(sessionId);
    if (stream) {
        stream.end();
        logStreams.delete(sessionId);
    }
}

export const logService = {
    writeInput(sessionId, buffer) {
        writeRaw(sessionId, 'IN', buffer);
    },
    writeOutput(sessionId, buffer) {
        writeRaw(sessionId, 'OUT', buffer);
    },
    closeLog
};
