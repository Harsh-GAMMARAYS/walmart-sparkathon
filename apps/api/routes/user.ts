import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getProfile } from '../controllers/userController';

const router = express.Router();

router.get('/profile', authenticateJWT, getProfile);

export default router; 