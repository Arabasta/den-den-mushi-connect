const jwt = require('jsonwebtoken');
const { createLogger } = require('winston');

const logger = createLogger({ /* your logger config */ });
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_here';

function validateToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        logger.error(`JWT validation failed: ${err.message}`);
        throw new Error('Invalid token');
    }
}

module.exports = {
    validateToken,
    middleware: require('./middleware')
};