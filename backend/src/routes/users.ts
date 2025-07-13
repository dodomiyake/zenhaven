import { Router, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        return res.json({ user: req.user?.toJSON() });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();

        await user.save();

        return res.json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 