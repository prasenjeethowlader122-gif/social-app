# Parallaxa Integration Guide

This document outlines the transition from Bluesky (ATProto) backend to Parallaxa independent backend.

## Architecture Overview

```
┌─────────────────────┐
│  React Native App   │
│   (iOS/Android)     │
└──────────┬──────────┘
           │
           │ HTTP/REST
           │
┌──────────▼──────────┐
│  Parallaxa Backend  │
│  (Node.js/Express)  │
└──────────┬──────────┘
           │
           │ PostgreSQL
           │
┌──────────▼──────────┐
│   PostgreSQL DB     │
└─────────────────────┘
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database URL and JWT secret
npm run db:migrate
npm run dev
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Update .env with backend URL
# EXPO_PUBLIC_PARALLAXA_API_URL=http://your-backend-url/api/v1

# Start development server
npm run web
# or
expo start
```

### 3. Database Setup

The backend uses Drizzle ORM with PostgreSQL. Tables are automatically created on first migration.

**Required Tables:**
- users
- posts
- likes
- comments
- follows

## API Documentation

### Authentication

**Register**
```
POST /api/v1/auth/register
Body: {
  email: string,
  handle: string,
  displayName: string,
  password: string (8+ chars, uppercase, lowercase, number)
}
Response: { token: string, user: User }
```

**Login**
```
POST /api/v1/auth/login
Body: {
  email: string,
  password: string
}
Response: { token: string, user: User }
```

### Users

**Get Profile**
```
GET /api/v1/users/:handle
Response: User (with stats)
```

**Update Profile**
```
PATCH /api/v1/users/me
Headers: Authorization: Bearer {token}
Body: { displayName?, bio?, avatarUrl?, bannerUrl?, isPrivate? }
```

**Follow User**
```
POST /api/v1/users/:userId/follow
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Posts

**Get Feed**
```
GET /api/v1/posts/feed?limit=20&offset=0
Headers: Authorization: Bearer {token}
Response: { posts: Post[], limit, offset }
```

**Create Post**
```
POST /api/v1/posts
Headers: Authorization: Bearer {token}
Body: { content: string (1-280 chars) }
Response: Post
```

**Like Post**
```
POST /api/v1/posts/:postId/like
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Search

**Search Users**
```
GET /api/v1/search/users?q=query&limit=20&offset=0
Response: { results: User[], limit, offset }
```

**Search Posts**
```
GET /api/v1/search/posts?q=query&limit=20&offset=0
Response: { results: Post[], limit, offset }
```

**Get Trending**
```
GET /api/v1/search/trending?limit=20&offset=0
Response: { results: Post[], limit, offset }
```

## Frontend API Client

Import and use the Parallaxa API client:

```typescript
import {
  register,
  login,
  getUserProfile,
  createPost,
  getFeed,
  likePost,
  searchUsers,
  setAuthToken,
  getAuthToken,
} from '@/lib/api/parallaxa-api'

// Register
const { token, user } = await register({
  email: 'user@example.com',
  handle: 'username',
  displayName: 'Display Name',
  password: 'SecurePass123',
})
setAuthToken(token)

// Get feed
const { posts } = await getFeed(20, 0)

// Create post
const post = await createPost({ content: 'Hello Parallaxa!' })

// Like post
await likePost(postId)

// Search
const { results: users } = await searchUsers('john')
```

## Migration from Bluesky

### Files to Update

1. **Session/Auth State**
   - Remove ATProto agent initialization
   - Use Parallaxa token-based auth instead

2. **API Calls**
   - Replace all @atproto/api calls with parallaxa-api functions
   - Update state management to work with new API responses

3. **Data Models**
   - Parallaxa uses simpler data structures than ATProto
   - Map ATProto records to Parallaxa types as needed

4. **UI Components**
   - Update all Bluesky branding/references
   - Replace Bluesky colors with Parallaxa purple theme
   - Update icons and imagery

### Key Differences

| ATProto (Bluesky) | Parallaxa |
|---|---|
| DID-based identifiers | UUID identifiers |
| Complex record system | Simple table-based data |
| Full federation | Single backend |
| PLC registry | JWT tokens |
| AppView/PDS architecture | Simple REST API |

## Environment Variables

### Backend (.env)
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret for signing tokens
- PORT: Server port (default 3001)
- CORS_ORIGIN: Allowed origins
- NODE_ENV: Environment (development/production)

### Frontend (.env)
- EXPO_PUBLIC_PARALLAXA_API_URL: Backend API endpoint
- EXPO_PUBLIC_ENV: Environment (development/testflight/production)

## Deployment

### Backend
1. Deploy to Vercel, AWS, or similar
2. Set up PostgreSQL database (Neon, RDS, etc.)
3. Configure environment variables
4. Run migrations in production environment

### Frontend
1. Build for iOS, Android, or web via EAS
2. Update EXPO_PUBLIC_PARALLAXA_API_URL in build config
3. Submit to App Store / Play Store

## Monitoring & Debugging

### Backend Logs
```bash
# Development
npm run dev

# View logs in production
# Check your deployment provider's logs
```

### Frontend Debugging
```typescript
// Enable debug logging
import { setAuthToken, getAuthToken } from '@/lib/api/parallaxa-api'

// Check current auth state
console.log('Auth Token:', getAuthToken())
```

## Troubleshooting

### CORS Issues
- Ensure CORS_ORIGIN includes your frontend URL
- In development: http://localhost:19006, http://localhost:3000, exp://localhost:19000

### Database Connection
```bash
# Test connection
npm run db:migrate
```

### Token Issues
- Tokens expire after 7 days
- Always send token in Authorization header: `Bearer {token}`
- Call setAuthToken after login/register

## Future Enhancements

- [ ] Real-time features (WebSockets)
- [ ] Message system (DMs)
- [ ] Video uploads
- [ ] Advanced search with filters
- [ ] Recommendation algorithm
- [ ] Moderation system
- [ ] Analytics/metrics
