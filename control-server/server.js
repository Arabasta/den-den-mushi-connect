const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

const users = {
    "alice": ["CloudShell", "RDS"],
    "bob": ["CloudWatch"],
    "charlie": ["S3", "Lambda"],
    "admin": ["CloudShell", "RDS", "CloudWatch", "S3", "Lambda"]
};

const groupHosts = {
    "CloudShell": [
        {instanceId: "ec2-54-255-144-215.ap-southeast-1.compute.amazonaws.com", name: "EC2 Test1"},
        {instanceId: "i-1234567890", name: "CloudShell Dev"},
        {instanceId: "i-0987654321", name: "CloudShell Prod"}
    ],
    "RDS": [
        {instanceId: "i-rds1234567", name: "RDS Primary"},
        {instanceId: "i-rds7654321", name: "RDS Replica"},
        {instanceId: "i-rds12123367", name: "RDS Primary 2"},
        {instanceId: "i-rds76543241111", name: "RDS Replica 2"}
    ],
    "CloudWatch": [
        {instanceId: "i-cw12345678", name: "CloudWatch Monitor"}
    ],
    "S3": [
        {instanceId: "i-s3storage01", name: "S3 Processing Node"}
    ],
    "Lambda": [
        {instanceId: "i-lambdaexec1", name: "Lambda Executor"}
    ]
};

app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/ticket', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ticket.html'));
});

const { validateTicket } = require('./ticketService');
app.post('/api/validate-ticket', (req, res) => {
    const { username, ticketId } = req.body;

    if (!username || !users[username]) {
        return res.status(400).json({ error: 'Invalid or missing user' });
    }

    if (!ticketId) {
        return res.status(400).json({ error: 'Missing ticket ID' });
    }

    const userGroups = users[username];
    const validation = validateTicket(ticketId, userGroups);

    if (!validation.valid) {
        return res.status(403).json({ error: `Invalid ticket: ${validation.reason}` });
    }

    res.json({ message: 'Ticket is valid', ticket: validation.ticket });
});

app.get('/hosts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hosts.html'));
});

app.get('/api/hosts', (req, res) => {
    const username = req.query.user;
    const groupFilter = req.query.group;

    if (!username || !users[username]) {
        return res.status(400).json({error: 'Invalid or missing user'});
    }

    let userGroups = users[username];
    const hostSet = new Map();

    if (groupFilter && groupFilter !== 'all') {
        if (!userGroups.includes(groupFilter)) {
            return res.status(403).json({error: 'User not in specified group'});
        }
        userGroups = [groupFilter];
    }

    userGroups.forEach(group => {
        const groupList = groupHosts[group] || [];
        groupList.forEach(instance => {
            hostSet.set(instance.instanceId, instance); // deduplicate by instanceId
        });
    });

    res.json({
        username,
        groups: users[username],
        hosts: Array.from(hostSet.values())
    });
});

const SECRET = 'peanut';
module.exports = {SECRET};

const redis = require('./redisClient');

app.post('/api/session', async (req, res) => {
    const {user, instanceId, osUser, sshPort, makeChange} = req.body;
    const sessionId = crypto.randomUUID();

    const session = {
        sessionId,
        user,
        connectionDetails: {
            osUser,
            instanceId,
            sshPort,
            makeChange
        },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
    };

    console.log(`Creating session for user ${user} on instance ${instanceId} with session ID ${sessionId}`);
    // debug redis
    console.log('Redis client:', redis);
    console.log('Redis client connected:', redis.isOpen);
    await redis.set(`session:${sessionId}`, JSON.stringify(session), {
        EX: 6 * 60 * 60 // expire after 6 hours
    });

    const token = jwt.sign({sessionId}, SECRET, {expiresIn: '5m'});

    console.log(`Generated token for session ${sessionId}: ${token}`);
    res.json({token, sessionId});
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

