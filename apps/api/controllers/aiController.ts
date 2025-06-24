import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService, AIRecommendationRequest, VirtualTryOnRequest } from '../services/aiService';
import { Product } from '../models/Product';

// AI-Recommendations
export const getAIRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { query, userPreferences } = req.body;
    const userId = req.user?.userId;

    if (!query) {
      return res.status(400).json({ message: 'Query is required!' });
    }

    const request: AIRecommendationRequest = {
      query,
      userPreferences,
      userId
    };

    const aiResponse = await aiService.getRecommendations(request);

    // Map AI recommendations
    const recommendedProducts = [];
    for (const aiProduct of aiResponse.products) {
      try {
        const product = await Product.findById(aiProduct.id);
        if (product) {
          recommendedProducts.push({
            ...product.toObject(),
            aiConfidence: aiProduct.confidence,
            aiReason: aiProduct.reason
          });
        }
      } catch (error) {
        console.error(`Product ${aiProduct.id} not found:`, error);
      }
    }

    res.json({
      products: recommendedProducts,
      explanation: aiResponse.explanation,
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions,
      totalFound: recommendedProducts.length
    });

  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ 
      message: 'Failed to get AI recommendations!',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Virtual-TryOn
export const generateVirtualTryOn = async (req: AuthRequest, res: Response) => {
  try {
    const { userImage, productId } = req.body;
    const userId = req.user?.userId;

    if (!userImage || !productId) {
      return res.status(400).json({ message: 'User image and product ID are required!' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
    }

    const request: VirtualTryOnRequest = {
      userImage,
      productId,
      userId
    };

    const aiResponse = await aiService.generateVirtualTryOn(request);

    res.json({
      processedImage: aiResponse.processedImage,
      confidence: aiResponse.confidence,
      processingTime: aiResponse.processingTime,
      product: {
        id: product._id,
        title: product.title,
        image: product.image
      }
    });

  } catch (error) {
    console.error('Virtual try-on error:', error);
    res.status(500).json({ 
      message: 'Failed to generate virtual try-on!',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// AI-Context
export const searchWithAIContext = async (req: AuthRequest, res: Response) => {
  try {
    const { query, context } = req.body;
    const userId = req.user?.userId;

    if (!query) {
      return res.status(400).json({ message: 'Query is required!' });
    }
    const aiResponse = await aiService.searchWithContext(query, context);

    // Map AI recommendations 
    const recommendedProducts = [];
    for (const aiProduct of aiResponse.products) {
      try {
        const product = await Product.findById(aiProduct.id);
        if (product) {
          recommendedProducts.push({
            ...product.toObject(),
            aiConfidence: aiProduct.confidence,
            aiReason: aiProduct.reason
          });
        }
      } catch (error) {
        console.error(`Product ${aiProduct.id} not found:`, error);
      }
    }

    res.json({
      products: recommendedProducts,
      explanation: aiResponse.explanation,
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions,
      totalFound: recommendedProducts.length
    });

  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ 
      message: 'Failed to search with AI context!',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAIServiceHealth = async (req: Request, res: Response) => {
  try {
    
    res.json({
      aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:4001',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 