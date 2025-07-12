import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getProfile, migrateSession } from '../controllers/userController';

const router = express.Router();

router.get('/profile', authenticateJWT, getProfile);
router.post('/migrate-session', authenticateJWT, migrateSession);

export default router; 