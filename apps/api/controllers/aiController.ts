import { Request, Response } from 'express';
import { aiService } from '../services/aiService';

export const getAgentQueryResponse = async (req: Request, res: Response) => {
  try {
    const { query, userId, context, user, browsingContext } = req.body;
    const aiResponse = await aiService.getAgentQueryResponse(query, userId, context, user, browsingContext);
    res.json(aiResponse);
  } catch (error) {
    const message = (error instanceof Error) ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};

export const imageSearch = async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'Image file is required.' });
    }
    const aiResponse = await aiService.imageSearch(req.file.path);
    res.json(aiResponse);
  } catch (error) {
    const message = (error instanceof Error) ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
};
// Old handlers for getAIRecommendations, generateVirtualTryOn, searchWithAIContext are now deprecated or commented out.
 