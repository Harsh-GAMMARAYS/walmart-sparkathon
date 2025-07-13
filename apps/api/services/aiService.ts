import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import GraphQLJSON from 'graphql-type-json';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'; // Use the correct port

export class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = AI_SERVICE_URL;
  }

  // Unified method for recommendations/search
  async getAgentQueryResponse(query: string, userId?: string, context?: any[], user?: any, browsingContext?: any): Promise<any> {
    const requestBody = {
      query_type: 'text',
      content: { text_query: query },
      uid: userId || 'default',
      action: 'toolagent',
      context: context || [],
      user: user || null,
      browsingContext: browsingContext || null
    };

    const response = await axios.post(`${this.baseURL}/ai/agentQuery`, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data;
  }

  async imageSearch(imagePath: string): Promise<any> {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(
      `${this.baseURL}/ai/imageSearch`,
      form,
      { headers: form.getHeaders() }
    );
    return response.data;
  }
}

export const aiService = new AIService(); 