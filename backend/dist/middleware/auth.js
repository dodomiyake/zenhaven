"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth-token';
function getTokenFromRequest(req) {
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME];
    }
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
const auth = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
};
exports.auth = auth;
const adminAuth = async (req, res, next) => {
    try {
        const authResult = await (0, exports.auth)(req, res, () => { });
        if (res.headersSent)
            return;
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
};
exports.adminAuth = adminAuth;
//# sourceMappingURL=auth.js.map