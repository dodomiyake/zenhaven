import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const COOKIE_NAME = 'auth-token';

function getTokenFromRequest(req: Request): string | null {
    // Prefer cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME];
    }
    // Fallback to Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = getTokenFromRequest(req);
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authResult = await auth(req, res, () => {});
        if (res.headersSent) return;
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
}; 