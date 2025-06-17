import fs from 'fs';

function getSshdConfig() {
    const sshdConfigPath = '/etc/ssh/sshd_config';
    if (!fs.existsSync(sshdConfigPath)) {
        throw new Error(`sshd_config file not found at ${sshdConfigPath}`);
    }

    return fs.readFileSync(sshdConfigPath, 'utf8');
}

function parseDirective(config, directiveName) {
    const regex = new RegExp(`^\\s*#?\\s*${directiveName}\\s+(\\S+)`, 'mi');
    const match = config.match(regex);
    if (match) {
        const isCommented = config.match(new RegExp(`^\\s*#\\s*${directiveName}`, 'mi'));
        return isCommented ? `${match[1]} (default)` : match[1];
    }
    return null;
}

function getMaxSessions() {
    try {
        const config = getSshdConfig();
        return parseDirective(config, 'MaxSessions');
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

function getMaxStartups() {
    try {
        const config = getSshdConfig();
        return parseDirective(config, 'MaxStartups');
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

export const sshdConfig = {
    MaxSessions: getMaxSessions(),
    MaxStartups: getMaxStartups()
};
