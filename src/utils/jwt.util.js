const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(payload) {
    return jwt.sign(payload, env.jwt.accessSecret, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, env.jwt.refreshSecret, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    })
}

function verifyAccessToken(token) {
    return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}