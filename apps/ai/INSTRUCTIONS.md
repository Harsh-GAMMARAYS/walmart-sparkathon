# 🤖 AI Service Setup Instructions - For Manodeep

## 📚 **What You're Building**
You're building the **AI backend service** that will handle:
- **Tavily API integration** → For intelligent product search and context
- **Groq API integration** → For fast LLM responses and recommendations
- **Replicate API integration** → For virtual try-on image generation
- **Multi-modal processing** → Handle text, voice, and image inputs
- **API endpoints** → That web/mobile apps can call for AI features

## 🛠️ **Tech Stack You'll Use**
- **Node.js** → JavaScript runtime for server
- **TypeScript** → Strongly typed JavaScript (OPTIONAL but recommended)
- **Express/Fastify** → Web framework for API endpoints
- **Tavily API** → For contextual search and information retrieval
- **Groq API** → For fast LLM inference and chat responses
- **Replicate API** → For image generation and virtual try-on

---

## 🏗️ **Understanding Our Project Structure**

### **What is a Monorepo?**
A monorepo is like having multiple related projects in one big folder:
```
walmart-sparkathon/
├── apps/web     → Harshit's Next.js website
├── apps/api     → Vedika's GraphQL backend
├── apps/ai      → YOUR AI service ✨
├── apps/mobile  → Dristant's mobile app
```
**Benefit**: Everyone can share code and work together easily!

### **What is Turborepo?**
Turborepo helps run multiple apps at once:
- `pnpm dev --filter ai` → Runs ONLY your AI service
- `turbo run dev` → Runs ALL apps together
- Caches builds to make everything faster

### **What is pnpm?**
pnpm is like npm, but faster and better for monorepos:
- `pnpm install` → Installs dependencies
- `pnpm add <package name>` → Adds new packages
- Works across all apps in the monorepo

---

## 🔗 **How Your AI Service Connects to the Team**

### **Integration Flow:**
```
[Web/Mobile App] 
    ↓ (User input: "Show me winter jackets")
[Vedika's GraphQL API] 
    ↓ (Calls your AI service)
[YOUR AI Service] 
    ↓ (Processes with Tavily/Groq)
[AI APIs] 
    ↓ (Returns AI response)
[Back to Web/Mobile] 
    ↓ (Shows personalized recommendations)
```

### **Your Responsibilities:**
1. **Receive requests** from Vedika's GraphQL API
2. **Process with AI APIs** (Tavily, Groq, Replicate)
3. **Return structured responses** that web/mobile can display
4. **Handle different input types** (text, voice transcripts, images)

---

## 🚀 **Step-by-Step Setup**

### **1️⃣ Initialize Your AI Service**
```bash
# Go to your folder
cd apps/ai

# Create package.json
npm init -y

# Install dependencies
pnpm add express cors dotenv
pnpm add axios # for making API calls to Tavily/Groq/Replicate
pnpm add multer # for handling image uploads
pnpm add -D nodemon @types/node @types/express # dev dependencies

# Optional: TypeScript setup
pnpm add -D typescript ts-node
npx tsc --init # if using TypeScript
```

### **2️⃣ Environment Variables Setup**
Create `.env` file in `apps/ai/`:
```env
# API Keys (get these from respective services)
TAVILY_API_KEY=your_tavily_api_key_here
GROQ_API_KEY=your_groq_api_key_here
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Server settings
PORT=4001
NODE_ENV=development
```

### **3️⃣ Basic Server Setup** (EXAMPLE)
Create `index.js` (or `index.ts` if using TypeScript):
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'AI Service is running!', timestamp: new Date().toISOString() });
});

// AI endpoints
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const { query, userPreferences } = req.body;
    
    // TODO: Call Tavily API for product context
    // TODO: Call Groq API for personalized recommendations
    
    res.json({
      products: [],
      explanation: "AI recommendations will go here",
      confidence: 0.85
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/try-on', async (req, res) => {
  try {
    const { userImage, productId } = req.body;
    
    // TODO: Call Replicate API for virtual try-on
    
    res.json({
      processedImage: "generated_image_url_here",
      confidence: 0.9
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 AI Service running on http://localhost:${PORT}`);
});
```

### **4️⃣ Package.json Scripts** (EXAMPLE)
```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "dev:ts": "nodemon --exec ts-node index.ts"
  }
}
```

### **5️⃣ Test Your Setup**
```bash
# Run your AI service
pnpm dev

# Test health endpoint
curl http://localhost:4001/health

# Should return: {"status":"AI Service is running!","timestamp":"..."}
```

---

## 🧠 **AI Integration Examples**

### **Tavily API Integration** (EXAMPLE)
```javascript
const axios = require('axios');

async function searchWithTavily(query) {
  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "basic",
      include_answer: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Tavily API error:', error.message);
    return null;
  }
}
```

### **Groq API Integration** (EXAMPLE)
```javascript
async function generateRecommendations(userQuery, context) {
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: "You are a fashion AI assistant. Provide personalized clothing recommendations."
        },
        {
          role: "user",
          content: `User query: ${userQuery}\nContext: ${context}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API error:', error.message);
    return "Unable to generate recommendations at the moment.";
  }
}
```

---

## 🔄 **How to Connect with Team**

### **For Vedika (Backend API):**
She will call your endpoints like this:
```javascript
// In Vedika's GraphQL resolvers
const aiResponse = await fetch('http://localhost:4001/api/ai/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userQuery, userPreferences })
});
```

### **API Response Format:**
Make sure your responses match what the team expects:
```javascript
// Recommendation response
{
  products: [
    { id: "1", name: "Winter Jacket", price: 99.99, confidence: 0.9 }
  ],
  explanation: "Based on your preferences for winter wear...",
  confidence: 0.85,
  suggestions: ["Try adding accessories", "Consider size up"]
}

// Try-on response
{
  processedImage: "https://cloudinary.com/generated-image.jpg",
  confidence: 0.9,
  processingTime: 2.5
}
```

---

## 🎯 **Your Main Tasks (Priority Order)**

### **Phase 1: Basic Setup**
1. ✅ Set up Node.js server with health check
2. ✅ Create API endpoints that Vedika can call
3. ✅ Test endpoints with dummy responses

### **Phase 2: AI Integration**
1. 🔄 Integrate Tavily API for product search
2. 🔄 Integrate Groq API for recommendations
3. 🔄 Test AI responses end-to-end

### **Phase 3: Advanced Features**
1. 🔄 Integrate Replicate API for virtual try-on
2. 🔄 Handle image uploads and processing
3. 🔄 Optimize response times and error handling

---

## 🆘 **Need Help?**

### **Common Issues:**
- **API keys not working** → Double-check .env file and key validity
- **CORS errors** → Make sure cors middleware is properly configured
- **Port conflicts** → Change PORT in .env if 4001 is taken
- **Dependencies not installing** → Run `pnpm install` from root directory first

### **Testing Your Service:**
- Use Postman or curl to test endpoints
- Check logs for API call errors
- Coordinate with Vedika to test integration

### **Coordination with Team:**
- **Share your endpoint URLs** with Vedika
- **Document your API response formats**
- **Let team know when AI features are ready for testing**

### **Resources:**
- [Tavily API Documentation](https://tavily.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Replicate API Documentation](https://replicate.com/docs)
- [Express.js Documentation](https://expressjs.com/)

**Questions?** Ask Harshit or the team! You're building the core AI brain of our app! 🧠🚀 