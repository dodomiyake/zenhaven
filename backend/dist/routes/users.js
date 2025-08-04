"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.auth, async (req, res) => {
    try {
        return res.json({ user: req.user?.toJSON() });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/profile', auth_1.auth, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email.toLowerCase();
        await user.save();
        return res.json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map