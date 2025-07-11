import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:4001';

export interface AIRecommendationRequest {
  query: string;
  userPreferences?: {
    style?: string;
    budget?: number;
    size?: string;
    color?: string;
    occasion?: string;
  };
  userId?: string;
}

export interface AIRecommendationResponse {
  products: Array<{
    id: string;
    name: string;
    price: number;
    confidence: number;
    reason?: string;
  }>;
  explanation: string;
  confidence: number;
  suggestions: string[];
}

export interface VirtualTryOnRequest {
  userImage: string; 
  productId: string;
  userId?: string;
}

export interface VirtualTryOnResponse {
  processedImage: string;
  confidence: number;
  processingTime: number;
}

export class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = AI_SERVICE_URL;
  }

// AI-Recommendation
  async getRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/ai/recommend`, request, {
        timeout: 30000, 
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('AI Service recommendation error:', error);
      throw new Error('Failed to get AI recommendations');
    }
  }

// Virtual-TryOn
  async generateVirtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/ai/try-on`, request, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('AI Service virtual try-on error:', error);
      throw new Error('Failed to generate virtual try-on');
    }
  }


// AI-Context
  async searchWithContext(query: string, context?: string): Promise<AIRecommendationResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/ai/search`, {
        query,
        context,
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('AI Service search error:', error);
      throw new Error('Failed to search with AI context');
    }
  }
}

export const aiService = new AIService(); 