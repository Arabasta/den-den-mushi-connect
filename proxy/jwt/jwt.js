import url from "url";
import jwt from "jsonwebtoken";
import {SECRET} from "../../control-server/server.js";

function extractToken(req) {
    const parsedUrl = url.parse(req.url, true);
    return parsedUrl?.query?.token;
}

function verifyJwt(req) {
    const token = extractToken(req);
    if (!token) {
        throw new Error('JWT token is missing');
    }

    console.log('Verifying JWT token...', token);
    return jwt.verify(token, SECRET);
}

export const jwtUtil = {
    verifyJwt
}