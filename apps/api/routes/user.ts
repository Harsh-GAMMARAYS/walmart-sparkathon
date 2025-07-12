import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getProfile, migrateSession, syncCart } from '../controllers/userController';

const router = express.Router();

router.get('/profile', authenticateJWT, getProfile);
router.post('/migrate-session', authenticateJWT, migrateSession);
router.post('/sync-cart', authenticateJWT, syncCart);

export default router; 