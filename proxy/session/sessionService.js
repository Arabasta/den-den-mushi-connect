import redis from '../redisClient.js';

async function getSession(sessionId) {
    const sessionJson = await redis.get(`session:${sessionId}`);
    if (!sessionJson) {
        console.warn(`Session with ID ${sessionId} not found in Redis.`);
        return null;
    }
    console.debug(sessionJson);

    return processSession(sessionJson);
}

async function processSession(sessionJson) {
    if (!sessionJson) return null;

    try {
        const session = JSON.parse(sessionJson);
        await validateSession(session);
        return session;
    } catch (error) {
        console.error(`Failed to parse session: ${error.message}`);
        return null;
    }
}

async function validateSession(session) {
    if (!session.sessionId) {
        console.error(`SessionId not found`);
        return false
    }

    const {instanceId, osUser, sshPort, makeChange} = session.connectionDetails || {};
    if (!session) throw new Error('Invalid session');

    if (!instanceId || !osUser || !sshPort) {
        throw new Error('Invalid session connection details');
    }
}

async function deleteSession(sessionId) {
    await redis.del(`session:${sessionId}`);
}

export const sessionService = {
    getSession,
    deleteSession
}
