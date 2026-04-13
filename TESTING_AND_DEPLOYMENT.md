# Parallaxa: Testing & Deployment Guide

## Testing Strategy

### Phase 1: Backend API Testing

#### 1.1 Unit Testing
```bash
cd backend
npm test
```

#### 1.2 Integration Testing
Test complete API flows with real database

**Test Case 1: User Registration Flow**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@parallaxa.app",
    "handle": "testuser",
    "displayName": "Test User",
    "password": "TestPass123"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "test@parallaxa.app",
    "handle": "testuser",
    "displayName": "Test User"
  }
}
```

**Test Case 2: Login Flow**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@parallaxa.app",
    "password": "TestPass123"
  }'
```

**Test Case 3: Create Post**
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Hello Parallaxa!"
  }'
```

**Test Case 4: Get Feed**
```bash
curl http://localhost:3001/api/v1/posts/feed?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Case 5: Like Post**
```bash
curl -X POST http://localhost:3001/api/v1/posts/POST_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Case 6: Search Users**
```bash
curl "http://localhost:3001/api/v1/search/users?q=test&limit=10"
```

#### 1.3 Error Handling Tests

Test with invalid data:
```bash
# Missing required field
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
# Expected: 400 error

# Duplicate email
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@parallaxa.app",
    "handle": "newuser",
    "displayName": "New User",
    "password": "TestPass123"
  }'
# Expected: 409 conflict

# Invalid password
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@parallaxa.app",
    "handle": "newuser",
    "displayName": "New User",
    "password": "weak"
  }'
# Expected: 400 error - password too weak

# Missing auth token
curl http://localhost:3001/api/v1/posts/feed
# Expected: 401 error
```

### Phase 2: Frontend Integration Testing

#### 2.1 Setup Frontend for Testing
```bash
# Create .env.local for testing
EXPO_PUBLIC_PARALLAXA_API_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_ENV=development
```

#### 2.2 Test Registration Flow
1. Launch app
2. Go to registration screen
3. Enter:
   - Email: test@parallaxa.app
   - Handle: testuser
   - Display Name: Test User
   - Password: TestPass123
4. Tap register
5. Verify token stored in secure storage
6. Verify app navigates to home screen
7. Verify user info displays correctly

#### 2.3 Test Login Flow
1. Logout from previous test
2. Go to login screen
3. Enter:
   - Email: test@parallaxa.app
   - Password: TestPass123
4. Tap login
5. Verify token stored
6. Verify navigation to feed
7. Verify user can see posts

#### 2.4 Test Feed & Posts
1. Verify feed loads posts from backend
2. Create new post:
   - Type: "Test post from Parallaxa"
   - Submit
   - Verify post appears at top of feed
3. Like a post:
   - Tap like button
   - Verify count increases
4. Unlike:
   - Tap like button again
   - Verify count decreases
5. Comment on post:
   - Tap comment
   - Type: "Great post!"
   - Verify comment appears

#### 2.5 Test User Interactions
1. Search for user:
   - Tap search
   - Enter: "testuser"
   - Verify results show
2. View user profile:
   - Tap on user
   - Verify profile loads
   - Verify follower/following counts show
3. Follow user:
   - Tap follow button
   - Verify count increases
   - Verify followed status shows
4. Unfollow:
   - Tap unfollow
   - Verify count decreases

#### 2.6 Test Search & Discovery
1. Search users:
   - Verify results display
   - Verify pagination works
2. Search posts:
   - Verify results display
3. View trending:
   - Verify trending posts load
   - Verify sorted by engagement

### Phase 3: Performance Testing

#### 3.1 Startup Performance
```bash
# Measure app startup time
# Goal: < 3 seconds

# Web
npm run build-web
# Load in browser, check DevTools Performance tab

# Mobile
# Use Xcode/Android Studio performance profiler
```

#### 3.2 API Response Times
```bash
# Test endpoint response time
time curl http://localhost:3001/api/v1/posts/feed \
  -H "Authorization: Bearer TOKEN"

# Goal: < 200ms
```

#### 3.3 Database Query Performance
```bash
# In backend, enable query logging
# Verify all queries complete in < 100ms
```

#### 3.4 Memory Usage
- Monitor app memory while:
  - Scrolling through feed
  - Loading images
  - Navigating between screens
- Goal: Stay under 100MB on mobile

### Phase 4: Platform-Specific Testing

#### iOS Testing
```bash
# Build for iOS
eas build --platform ios

# Or run locally
expo run:ios

# Test on:
# - iPhone 14/15 simulator
# - iPhone 12/13 (physical device)
# - iPad

# Checklist:
- [ ] App launches without crash
- [ ] Auth flow works
- [ ] Feed loads and scrolls smoothly
- [ ] Images load correctly
- [ ] All buttons responsive
- [ ] App icons correct
- [ ] Splash screen shows correctly
- [ ] Orientation changes work
- [ ] Safe area respects notch
```

#### Android Testing
```bash
# Build for Android
eas build --platform android

# Or run locally
expo run:android

# Test on:
# - Android Emulator (latest Android version)
# - Physical Android device (Android 12+)

# Checklist:
- [ ] App launches without crash
- [ ] Auth flow works
- [ ] Feed loads and scrolls smoothly
- [ ] Images load correctly
- [ ] All buttons responsive
- [ ] App icons correct
- [ ] Splash screen shows correctly
- [ ] Back button behavior correct
- [ ] Keyboard appearance correct
```

#### Web Testing
```bash
# Build web
npm run build-web

# Test in:
# - Chrome (latest)
# - Firefox (latest)
# - Safari (latest)

# Checklist:
- [ ] App loads in all browsers
- [ ] Auth flow works
- [ ] Feed loads and scrolls smoothly
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Keyboard shortcuts work
- [ ] All touch gestures work
- [ ] Dark mode works
```

### Phase 5: Security Testing

#### 5.1 Authentication Security
```bash
# Test invalid token
curl http://localhost:3001/api/v1/posts/feed \
  -H "Authorization: Bearer invalid-token"
# Should return 401

# Test expired token
# Generate token that expires
# Wait for expiry
# Attempt request
# Should return 401

# Test token reuse
# Logout (clear token)
# Attempt request with old token
# Should return 401
```

#### 5.2 Authorization Security
```bash
# Test creating post as wrong user
# Get token for user A
# Create post as user A
# Get token for user B
# Try to delete user A's post as user B
# Should return 403

# Test private endpoints
# Try accessing /users/me without token
# Should return 401
```

#### 5.3 Input Validation
```bash
# Test SQL injection
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content": "'; DROP TABLE users; --"}'
# Should safely escape/reject

# Test XSS
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content": "<script>alert(1)</script>"}'
# Should sanitize/escape

# Test large payloads
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"content": "'"$(printf 'A%.0s' {1..10000})"'"}'
# Should reject (413 Payload Too Large)
```

## Deployment

### Backend Deployment

#### Option 1: Deploy to Vercel
```bash
cd backend
vercel --prod
```

Configure environment variables in Vercel:
- DATABASE_URL
- JWT_SECRET (strong 32+ character string)
- CORS_ORIGIN
- NODE_ENV=production

#### Option 2: Deploy to AWS
```bash
# Create Lambda function
# Or deploy to EC2/ECS

# Environment setup
export DATABASE_URL=<production-database>
export JWT_SECRET=<strong-secret>
export CORS_ORIGIN=<production-domain>
export NODE_ENV=production
```

#### Option 3: Deploy to DigitalOcean
```bash
# Create App on DigitalOcean
# Connect GitHub repo
# Set environment variables
# Deploy
```

#### Database Setup
```bash
# Create PostgreSQL database
# Option 1: Neon (serverless PostgreSQL)
# https://neon.tech/

# Option 2: AWS RDS
# Create PostgreSQL instance

# Option 3: DigitalOcean
# Create PostgreSQL database

# Run migrations
DATABASE_URL=<production-url> npm run db:migrate

# Verify migrations succeeded
DATABASE_URL=<production-url> psql -c "SELECT * FROM users LIMIT 0;"
```

### Frontend Deployment

#### Option 1: EAS Build (Recommended)
```bash
# Build for all platforms
eas build --platform all --release

# Or individual platforms
eas build --platform ios --release
eas build --platform android --release

# Update app.json with:
{
  "runtimeVersion": "1.0.0",
  "extra": {
    "apiUrl": "https://api.parallaxa.app/api/v1"
  }
}
```

#### Option 2: Web Deployment (Vercel)
```bash
# Build web
npm run build-web

# Deploy to Vercel
vercel --prod

# Or push to GitHub and auto-deploy
git push origin main
```

#### Option 3: Submit to App Stores

**iOS App Store**
```bash
# Prerequisites:
# - Apple Developer Account
# - TestFlight setup
# - App Review guidelines

# Build and submit
eas submit -p ios
```

**Google Play Store**
```bash
# Prerequisites:
# - Google Play Developer Account
# - Signed APK/AAB

# Build and submit
eas submit -p android
```

### Post-Deployment Checklist

- [ ] Backend health check endpoint returns 200
- [ ] All API endpoints responding correctly
- [ ] Database migrations completed successfully
- [ ] Frontend can connect to production API
- [ ] Authentication works end-to-end
- [ ] Users can create accounts
- [ ] Users can post and interact
- [ ] Search functionality working
- [ ] Error logging configured (Sentry, etc.)
- [ ] Monitoring/alerting set up
- [ ] CORS properly configured
- [ ] SSL/TLS certificates valid
- [ ] Database backups configured
- [ ] Rate limiting configured if needed
- [ ] CDN configured for static assets

## Monitoring & Logging

### Backend Monitoring
```bash
# View logs
# Vercel
vercel logs --tail

# AWS
aws logs tail /aws/lambda/parallaxa-api --follow

# DigitalOcean
# View via dashboard
```

### Error Tracking
```bash
# Setup Sentry for error tracking
# https://sentry.io/

# In backend
npm install @sentry/node

# Configure in index.ts
import * as Sentry from "@sentry/node"
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### Performance Monitoring
```bash
# Setup database query monitoring
# Enable slow query log in PostgreSQL

# Monitor API response times
# Use application performance monitoring (APM)
# - New Relic
# - DataDog
# - Elastic
```

## Rollback Plan

If critical issues occur post-deployment:

### Backend Rollback
```bash
# Vercel
vercel rollback

# Or redeploy previous version
git checkout <previous-commit>
vercel --prod
```

### Frontend Rollback
```bash
# Use EAS
eas builds list
eas builds info <build-id>

# Resubmit previous build
# Or rebuild from previous commit
```

## Continuous Integration/Deployment

### GitHub Actions Workflow
```yaml
name: Deploy Parallaxa

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: cd backend && npm install
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: eas build --platform all --release
```

## Success Criteria

All deployment complete when:
- ✅ Backend API responding at production URL
- ✅ All 17 API endpoints working correctly
- ✅ Database initialized and migrations successful
- ✅ Frontend app builds for iOS, Android, and Web
- ✅ Authentication flow works end-to-end
- ✅ Users can create posts and interact
- ✅ Search and discovery working
- ✅ Performance metrics within acceptable ranges
- ✅ Error logging and monitoring configured
- ✅ Security tests passing
- ✅ Documentation complete and updated

## Troubleshooting

### Backend Issues
See `PARALLAXA_DEVELOPER_GUIDE.md` for troubleshooting

### Frontend Issues
See `REMAINING_WORK.md` for known issues and solutions

### Database Issues
```bash
# Check connection
psql $DATABASE_URL -c "SELECT NOW();"

# View migrations
psql $DATABASE_URL -c "SELECT * FROM drizzle_migrations;"

# Reset database (dev only)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:migrate
```

## Support & Escalation

1. Check error logs and monitoring
2. Review commit history to identify changes
3. Rollback if necessary
4. File issue with reproduction steps
5. Engage team for critical issues
