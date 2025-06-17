import pty from "node-pty";
import {config} from "../config/config.js";

function sshClientArgs(sshKeyPath, sshPort, instanceId, osUser) {
    return [
        '-i', sshKeyPath,
        '-p', sshPort,
        `${osUser}@${instanceId}`,
        '-o', `LogLevel=${config.ssh.logLevel}`,
        '-o', `PermitLocalCommand=${config.ssh.permitLocalCommand}`,
        '-o', `UserKnownHostsFile=${config.ssh.userKnownHostsFile}`,
        '-o', `StrictHostKeyChecking=${config.ssh.strictHostKeyChecking}`,
        '-o', `ConnectTimeout=${config.ssh.connectTimeout}`,
    ];
}

function ptyOptions() {
    return {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: {
            ...process.env,
            TERM: 'xterm-256color',
        },
    };
}

export async function sshSpawn(sshKeyPath, sshPort, instanceId, osUser, onSpawn) {
    console.log(`Spawning SSH session for instance ${instanceId} as user ${osUser} on port ${sshPort} with key ${sshKeyPath}`);
    const shell = pty.spawn('ssh',
        sshClientArgs(sshKeyPath, sshPort, instanceId, osUser),
        ptyOptions());

    if (!shell) {
        throw new Error('Failed to spawn SSH session');
    }

    if (onSpawn && typeof onSpawn === 'function') {
        onSpawn(shell);
    }

    return shell;
}