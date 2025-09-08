import express from 'express'
import { Login, Logout, onboard, signUp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get("/me", protect,(req, res) => {
    res.status(200).json({success: true, user: req.user});
});

router.post("/signup", signUp);
router.post('/login', Login);
router.post('/logout', Logout);
router.post('/onboarding', protect, onboard);

export default router;