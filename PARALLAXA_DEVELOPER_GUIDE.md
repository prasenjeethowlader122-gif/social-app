# Parallaxa Developer Guide

## Quick Start for Developers

This guide helps developers understand the Parallaxa architecture and continue development.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│        React Native Frontend (Expo)         │
│         (iOS, Android, Web)                 │
│  ├─ Login/Register Screens                  │
│  ├─ Feed & Post Views                       │
│  ├─ User Profiles                           │
│  ├─ Search & Discovery                      │
│  └─ Settings                                │
└────────────┬────────────────────────────────┘
             │ HTTP/REST (JSON)
             │ JWT Auth in Headers
             │ Parallaxa API Client
             │
┌────────────▼────────────────────────────────┐
│    Node.js Express Backend Server           │
│         (localhost:3001 dev)                │
│  ├─ /api/v1/auth/* - Authentication        │
│  ├─ /api/v1/users/* - User Management      │
│  ├─ /api/v1/posts/* - Posts & Engagement   │
│  └─ /api/v1/search/* - Search & Trending   │
└────────────┬────────────────────────────────┘
             │ SQL Queries (Drizzle ORM)
             │
┌────────────▼────────────────────────────────┐
│    PostgreSQL Database (Neon/Local)         │
│  ├─ users table                             │
│  ├─ posts table                             │
│  ├─ likes table                             │
│  ├─ comments table                          │
│  └─ follows table                           │
└─────────────────────────────────────────────┘
```

## File Structure Overview

### Frontend (React Native)
```
src/
├── lib/api/
│   └── parallaxa-api.ts          # API client (use this!)
├── screens/                      # App screens
├── state/                        # Redux/state management
├── view/                         # UI components
└── locale/                       # Translations
```

**Key File**: `/src/lib/api/parallaxa-api.ts` - All API calls go through this

### Backend (Node.js)
```
backend/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── db/
│   │   ├── index.ts            # Database connection
│   │   └── schema.ts           # All table definitions
│   ├── routes/                 # API route handlers
│   │   ├── auth.ts             # /auth endpoints
│   │   ├── users.ts            # /users endpoints
│   │   ├── posts.ts            # /posts endpoints
│   │   └── search.ts           # /search endpoints
│   ├── middleware/
│   │   └── auth.ts             # JWT verification
│   └── utils/
│       └── auth.ts             # Password & token utils
├── .env                         # Environment variables
└── package.json
```

## Common Development Tasks

### Adding a New API Endpoint

#### 1. Backend Route
Create in `backend/src/routes/` or add to existing file:

```typescript
router.post('/newfeature', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId
    const { data } = req.body
    
    // Do something
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })
    
    res.json(result)
  } catch (error) {
    console.error('[Error]', error)
    res.status(500).json({ error: 'Operation failed' })
  }
})
```

#### 2. Frontend API Client
Add to `src/lib/api/parallaxa-api.ts`:

```typescript
export async function newFeature(data: any): Promise<any> {
  return request('/posts/newfeature', {
    method: 'POST',
    body: data,
  })
}
```

#### 3. Use in Component
```typescript
import { newFeature } from '@/lib/api/parallaxa-api'

// In your component:
const result = await newFeature({ /* data */ })
```

### Adding a New Database Table

#### 1. Update Schema
Edit `backend/src/db/schema.ts`:

```typescript
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Add relations if needed
export const newTableRelations = relations(newTable, ({ one, many }) => ({
  // ...
}))
```

#### 2. Generate Migration
```bash
cd backend
npm run build  # Uses drizzle-kit to generate migration
```

#### 3. Run Migration
```bash
npm run db:migrate
```

### Updating the UI Theme

#### Colors
Edit `app.config.js` to change the primary color:
```javascript
primaryColor: '#7C3AED', // Change this
```

The Parallaxa brand color is **#7C3AED** (deep purple).

#### Component Styling
Frontend components use a theme system. Update colors in the theme configuration (typically in `src/` directory).

### Authentication Flow

#### Register
```typescript
import { register, setAuthToken } from '@/lib/api/parallaxa-api'

const { token, user } = await register({
  email: 'user@example.com',
  handle: 'username',
  displayName: 'User Name',
  password: 'SecurePass123', // 8+ chars, uppercase, lowercase, number
})

setAuthToken(token) // Store token in secure storage
```

#### Login
```typescript
import { login, setAuthToken } from '@/lib/api/parallaxa-api'

const { token, user } = await login({
  email: 'user@example.com',
  password: 'SecurePass123',
})

setAuthToken(token)
```

#### Using Authenticated Requests
Any function that starts with `authMiddleware` in the backend requires the token:
- It's automatically added by the API client
- Token is sent in `Authorization: Bearer {token}` header

### Running the Full Stack

#### Terminal 1: Backend
```bash
cd backend
npm install
cp .env.example .env
# Update .env with DATABASE_URL
npm run dev
# Runs on http://localhost:3001
```

#### Terminal 2: Frontend  
```bash
npm install
# Update .env with EXPO_PUBLIC_PARALLAXA_API_URL
npm run web
# or: expo start
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/parallaxa
JWT_SECRET=your_secret_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:19006,http://localhost:3000
```

### Frontend (.env)
```
EXPO_PUBLIC_PARALLAXA_API_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_ENV=development
```

## Testing Endpoints

### Using curl
```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "handle": "testuser",
    "displayName": "Test User",
    "password": "TestPass123"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get profile (replace TOKEN with actual token)
curl http://localhost:3001/api/v1/users/testuser \
  -H "Authorization: Bearer TOKEN"
```

## Debugging

### Backend Logging
The backend logs all requests and errors. Look for:
- `[Database Error]` - Database connection issues
- `[Auth Error]` - Authentication issues
- `[<RouteType> Error]` - Specific route errors

### Frontend Debugging
```typescript
import { getAuthToken, setAuthToken } from '@/lib/api/parallaxa-api'

// Check current token
console.log('Token:', getAuthToken())

// Set new token
setAuthToken('new-token-here')
```

### Database Debugging
```bash
# Connect directly to PostgreSQL
psql postgresql://user:pass@localhost:5432/parallaxa

# View tables
\dt

# Query users
SELECT * FROM users;
```

## Performance Tips

1. **Pagination**: Always use limit/offset for lists
   ```typescript
   const feed = await getFeed(20, 0) // 20 posts, starting at offset 0
   ```

2. **Caching**: Use React Query or SWR for data fetching
   - Reduces unnecessary API calls
   - Better offline support

3. **Token Refresh**: Implement token refresh logic
   - JWT tokens expire after 7 days
   - Force re-login after expiry

4. **Image Optimization**: Compress images before upload
   - Reduces bandwidth
   - Faster uploads

## Common Issues & Solutions

### "CORS error" 
- Backend: Check CORS_ORIGIN includes your frontend URL
- Frontend: Check API URL is correct in .env

### "Token expired"
- Generate new token by logging in again
- Implement automatic refresh token logic

### "Database connection failed"
- Check DATABASE_URL is valid
- Ensure PostgreSQL is running
- Verify database exists

### "POST 400 Bad Request"
- Check request body format matches API expectations
- Verify required fields are present
- Check Zod validation error message

## Version Information

- **Node.js**: 20+
- **React**: 19.1
- **React Native**: 0.81+
- **Express**: 4.18+
- **PostgreSQL**: 14+
- **TypeScript**: 5.3+

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [React Native Docs](https://reactnative.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## Getting Help

1. Check error messages carefully - they often indicate the problem
2. Review PARALLAXA_INTEGRATION.md for architecture details
3. Check backend logs for API errors
4. Use browser dev tools for frontend debugging
5. Test API endpoints with curl before using in app

## Next Priorities

1. Remove all @atproto/api dependencies from frontend
2. Update UI components with Parallaxa branding
3. Implement secure token storage (AsyncStorage or SecureStore)
4. Add proper error handling UI
5. Implement loading states and skeleton screens
6. Add offline support with local caching
7. Implement background sync
8. Add proper input validation in UI
