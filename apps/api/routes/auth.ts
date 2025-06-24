import express from 'express';
import { register, login, logout } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/profile', authenticateJWT, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized!' });
  }
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router; 