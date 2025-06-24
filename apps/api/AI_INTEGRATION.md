# 🤖 AI Service Integration Documentation

## 📚 **Overview**
 API now includes full integration with the AI service for smart product recommendations, virtual try-on, and contextual search.
 The integration supports both REST API endpoints and GraphQL mutations.

## 📡 **REST API Endpoints**
- ✅ **Get AI Recommendations**
- **POST** `/ai/recommendations`
Get personalized product recommendations based on user query and preferences.

- **Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

- **Request Body:**
```json
{
  "query": "winter jackets for women",
  "userPreferences": {
    "style": "casual",
    "budget": 150,
    "size": "M",
    "color": "black",
    "occasion": "daily"
  }
}
```
- **Response:**
```json
{
  "products": [
    {
      "_id": "product_id",
      "title": "Warm Winter Jacket",
      "price": 89.99,
      "aiConfidence": 0.95,
      "aiReason": "Matches your casual style and budget"
    }
  ],
  "explanation": "Based on your preference for casual winter wear...",
  "confidence": 0.85,
  "suggestions": ["Try adding accessories", "Consider size up"],
  "totalFound": 5
}
```
- ✅ **Generate Virtual Try-On**
- **POST** `/ai/try-on`
Generate a virtual try-on image combining user photo with product.

- **Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

- **Request Body:**
```json
{
  "userImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "productId": "product_id_here"
}
```

- **Response:**
```json
{
  "processedImage": "https://cloudinary.com/generated-image.jpg",
  "confidence": 0.92,
  "processingTime": 2.5,
  "product": {
    "id": "product_id",
    "title": "Fashion Jacket",
    "image": "product_image_url"
  }
}
```
- ✅ **Search with AI Context**
- **POST** `/ai/search`
Search products with AI-powered context understanding.

- **Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```
- **Request Body:**
```json
{
  "query": "something for a wedding",
  "context": "formal event, summer wedding, outdoor ceremony"
}
```
- **Response:**
```json
{
  "products": [
    {
      "_id": "product_id",
      "title": "Elegant Summer Dress",
      "price": 129.99,
      "aiConfidence": 0.88,
      "aiReason": "Perfect for outdoor summer wedding"
    }
  ],
  "explanation": "Based on the wedding context...",
  "confidence": 0.88,
  "suggestions": ["Consider matching accessories"],
  "totalFound": 3
}
```

## 🎯 **GraphQL Integration**

- ✅ **Mutations**
### Get AI Recommendations
```graphql
mutation GetRecommendations($input: AIRecommendationInput!) {
  getAIRecommendations(input: $input) {
    products {
      id
      title
      price
      aiConfidence
      aiReason
    }
    explanation
    confidence
    suggestions
    totalFound
  }
}
```

**Variables:**
```json
{
  "input": {
    "query": "winter jackets for women",
    "userPreferences": {
      "style": "casual",
      "budget": 150,
      "size": "M"
    }
  }
}
```

### Generate Virtual Try-On
```graphql
mutation GenerateTryOn($input: VirtualTryOnInput!) {
  generateVirtualTryOn(input: $input) {
    processedImage
    confidence
    processingTime
    product {
      id
      title
      image
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "userImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "productId": "product_id_here"
  }
}
```

### Search with AI Context
```graphql
mutation SearchWithContext($query: String!, $context: String) {
  searchWithAIContext(query: $query, context: $context) {
    products {
      id
      title
      price
      aiConfidence
      aiReason
    }
    explanation
    confidence
    suggestions
    totalFound
  }
}
```

**Variables:**
```json
{
  "query": "something for a wedding",
  "context": "formal event, summer wedding"
}
```

## 🔐 **Authentication**
- ✅ **REST API**: Include `Authorization: Bearer <token>` header
- ✅ **GraphQL**: Include `Authorization: Bearer <token>` header

## 🛡️ **Error Handling**
- ✅ **Authentication Required**
```json
{"message": "Authentication required"}
```
- ✅ **Invalid Input**
```json
{"message": "Query is required!"}
```

## 🔄 **Fallback Behavior**
- ✅ **Recommendations**: Returns 503 with fallback flag
- ✅ **Search**: Falls back to regular MongoDB search
- ✅ **Virtual Try-On**: Returns 503 with fallback flag


## 🚀 **Usage Examples**
### GraphQL Client Integration
```javascript
import { gql } from '@apollo/client';

const GET_RECOMMENDATIONS = gql`
  mutation GetRecommendations($input: AIRecommendationInput!) {
    getAIRecommendations(input: $input) {
      products {
        id
        title
        price
        aiConfidence
        aiReason
      }
      explanation
      confidence
      suggestions
    }
  }
`;
```

## 🔧 **Configuration**
### Timeouts
- ✅ **Recommendations**: 30 seconds
- ✅ **Virtual Try-On**: 60 seconds

## 📊 **Monitoring**
Monitor these metrics:
- Success/failure rates
- Fallback usage
- User engagement with AI features

## 🆘 **Troubleshooting**

### Common Issues:
1. **AI Service Not Responding**: Check if AI service is running on port 4001
2. **Authentication Errors**: Verify JWT token is valid
3. **Timeout Errors**: Increase timeout values for complex queries
4. **CORS Issues**: Ensure AI service allows requests from your API

### Debug Mode:
Enable debug logging by setting `NODE_ENV=development` in your environment. 