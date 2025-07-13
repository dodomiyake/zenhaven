import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User, IUser } from '../models/User';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth-token';

// Generate JWT token
const generateToken = (user: IUser): string => {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Helper: Set auth cookie
function setAuthCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

// Helper: Clear auth cookie
function clearAuthCookie(res: Response) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}

// Register user
router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isLength({ min: 7, max: 15 }).withMessage('Phone must be 7-15 digits').matches(/^\d+$/).withMessage('Phone must contain only digits'),
    body('address').optional().isLength({ max: 100 }).withMessage('Address must be at most 100 characters'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], async (req: Request, res: Response) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone, address, avatar } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            phone,
            address,
            avatar
        });

        await user.save();

        // Generate token
        const token = generateToken(user);
        setAuthCookie(res, token);

        return res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req: Request, res: Response) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);
        setAuthCookie(res, token);

        return res.json({
            message: 'Login successful',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
    try {
        return res.json({ user: req.user?.toJSON() });
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout (clear cookie)
router.post('/logout', (req: Request, res: Response) => {
    clearAuthCookie(res);
    return res.json({ message: 'Logged out successfully' });
});

export default router; 