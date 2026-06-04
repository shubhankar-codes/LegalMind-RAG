# AI Constitution - Setup & Deployment Guide

## Project Overview

AI Constitution is a modern AI-powered legal assistant that helps citizens understand their constitutional rights using Gemini 2.5 Flash via OpenRouter, with MongoDB for data persistence and integrated government APIs showcase.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB for data persistence
- OpenRouter API integration (Gemini 2.5 Flash)
- CORS support

## Prerequisites

- Node.js 16+ and npm
- MongoDB installed and running locally, or MongoDB Atlas connection string
- OpenRouter API key (get from https://openrouter.ai)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (or update the existing one):

```
MONGODB_URI=mongodb://localhost:27017/ai-constitution
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-constitution?retryWrites=true&w=majority

OPENROUTER_API_KEY=your_openrouter_api_key_here
API_PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000
```

### 3. Start MongoDB (if local)

```bash
# On macOS with Homebrew:
brew services start mongodb-community

# Or run MongoDB in Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run Development Servers

**Option A: Run both servers with one command**

```bash
npm run dev:all
```

This will start:
- Express server on `http://localhost:5000`
- Vite dev server on `http://localhost:5173`

**Option B: Run servers separately**

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── GovernmentAPIs.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   └── AskQuestion.tsx
│   ├── data/
│   │   └── government-apis.ts
│   ├── types/
│   │   └── legal.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts                 # Express backend
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoints

### POST /api/query
Process a legal question through Gemini 2.5 Flash

**Request:**
```json
{
  "question": "Can police arrest me without a warrant?",
  "userConsent": false
}
```

**Response:**
```json
{
  "success": true,
  "queryId": "uuid-string",
  "summary": "Simple explanation...",
  "constitutionalArticles": [
    {
      "article": "Article 21",
      "text": "Article description...",
      "relevance": "How it applies..."
    }
  ],
  "practicalAdvice": "Step-by-step guidance...",
  "confidenceScore": 85,
  "disclaimer": "Legal disclaimer..."
}
```

### GET /api/queries
Fetch stored queries (with user consent)

**Response:**
```json
{
  "queries": [
    {
      "_id": "...",
      "question": "...",
      "ai_response": "...",
      "constitutional_articles": [...],
      "confidence_score": 85,
      "created_at": "2024-02-20T...",
      "user_consent_storage": true
    }
  ]
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "AI Constitution API is running"
}
```

## MongoDB Schema

### legal_queries Collection

```javascript
{
  _id: ObjectId,
  question: String,
  ai_response: String (JSON stringified),
  constitutional_articles: Array,
  confidence_score: Number (0-100),
  created_at: Date,
  user_consent_storage: Boolean
}
```

## Deployment

### Frontend (Vite)

Build for production:
```bash
npm run build
```

Output is in `dist/` directory.

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

### Backend (Express + Node.js)

Deploy to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

Example for Heroku:
```bash
npm install -g heroku-cli
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI=your_connection_string
heroku config:set OPENROUTER_API_KEY=your_api_key
git push heroku main
```

## Features

### Landing Page
- Hero section with CTA
- Features showcase (3 cards)
- How it works section (3 steps)
- Government APIs catalog (12+ integrated services)
- Gemini 2.5 Flash information section
- Legal disclaimer
- Responsive design

### Ask Question Page
- Large textarea input
- User consent checkbox
- Loading state with animation
- Results display:
  - Legal summary
  - Collapsible constitutional articles
  - Practical advice
  - Confidence score indicator
  - Legal disclaimer

### Government APIs
Showcase of 12 integrated government services:
- GST Portal API
- Aadhaar API
- Income Tax e-Filing
- Passport Services
- MCA Portal
- National Portal
- Udyam Registration
- Court Case Status
- Digital Signature
- Land Records
- Police Verification
- Labor Compliance

Each with category filtering and detailed information.

## Demo Mode

If `OPENROUTER_API_KEY` is not configured, the application runs in demo mode with sample responses, allowing you to test the UI and flow without API keys.

## OpenRouter Integration

The application uses OpenRouter to access Google's Gemini 2.5 Flash model.

**Steps to get started:**
1. Visit https://openrouter.ai
2. Sign up/login
3. Go to Settings > API Keys
4. Create a new key
5. Add it to your `.env` file as `OPENROUTER_API_KEY`

**Why OpenRouter?**
- No quota limits
- Unified API for multiple models
- Easy key management
- Automatic token counting

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, ensure IP is whitelisted

### API Not Responding
- Check if backend server is running (port 5000)
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Gemini API Not Working
- Verify OpenRouter API key
- Check if key has active credits
- Review API logs on OpenRouter dashboard

### Build Errors
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist`
- Run `npm run typecheck` to verify TypeScript

## Performance Tips

1. Use MongoDB indexes on frequently queried fields
2. Implement query caching for popular questions
3. Optimize images in government APIs section
4. Consider lazy loading for API cards
5. Use production builds for deployment

## Security Best Practices

1. Never commit `.env` file
2. Use environment variables for all secrets
3. Implement rate limiting on API endpoints
4. Add authentication for stored queries
5. Validate all user inputs on backend
6. Use HTTPS in production
7. Implement CORS whitelist for production

## Support & Documentation

- OpenRouter Docs: https://openrouter.ai/docs
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

## License

This project is built for citizens of India to understand their constitutional rights.

---

**Built with** React, Express, MongoDB, and Gemini 2.5 Flash
