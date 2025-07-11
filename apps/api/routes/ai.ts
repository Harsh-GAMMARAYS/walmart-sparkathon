import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getAIRecommendations, generateVirtualTryOn, searchWithAIContext} from '../controllers/aiController';

const router = express.Router();

// AI endpoints 
router.post('/recommendations', authenticateJWT, getAIRecommendations);
router.post('/try-on', authenticateJWT, generateVirtualTryOn);
router.post('/search', authenticateJWT, searchWithAIContext);

export default router; 