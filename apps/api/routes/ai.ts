import express from 'express';
import multer from 'multer';
// import { authenticateJWT } from '../middleware/auth';
import { getAgentQueryResponse, imageSearch } from '../controllers/aiController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// AI endpoints
router.post('/agentQuery', getAgentQueryResponse);
router.post('/imageSearch', upload.single('image'), imageSearch);

export default router; 