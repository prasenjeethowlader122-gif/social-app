# Parallaxa: Remaining Work & Implementation Roadmap

## Overview

The Parallaxa infrastructure is now ready with a complete backend API, database schema, and frontend API client. This document outlines the remaining work to complete the UI rebrand and launch the app.

## Phase 5: Design & Build Frontend UI (Current)

### 5.1 Remove ATProto Dependencies ⏳
**Priority**: HIGH  
**Files to Update**: ~50+ files

#### Steps:
1. Remove `@atproto/api` from package.json
2. Find all imports of ATProto:
   ```bash
   grep -r "@atproto" src/
   grep -r "ATProto" src/
   grep -r "BskyAgent" src/
   grep -r "did:" src/
   ```
3. Replace with Parallaxa API calls
4. Update session/auth state management
5. Remove ATProto type definitions
6. Clean up unused models

**Key Areas**:
- `src/state/session/agent.ts` - Replace with Parallaxa client
- `src/state/queries/*` - Update all query functions
- Authentication flows
- Feed generation
- Search functionality
- Profile data fetching

### 5.2 Update Branding Throughout UI ⏳
**Priority**: HIGH  
**Files to Update**: ~100+ files

#### Text Replacements:
- "Bluesky" → "Parallaxa"
- "Blue Sky" → "Parallaxa"
- "bsky.app" → "parallaxa.app"
- "@atproto" → references to Parallaxa
- ATProto terminology → REST API terminology

#### Commands:
```bash
# Find all instances
grep -r "Bluesky" src/
grep -r "bsky" src/
grep -r "Blue Sky" src/

# Replace (with caution)
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/Bluesky/Parallaxa/g'
```

### 5.3 Update Color Scheme ⏳
**Priority**: HIGH  
**Theme Color**: #7C3AED (Purple)

#### Tasks:
1. Find color definitions in theme/styling
2. Replace:
   - Primary blue (#006AFF) → Purple (#7C3AED)
   - Secondary colors as needed
   - Text colors for contrast
3. Update:
   - Button styles
   - Link colors
   - Active/focus states
   - Gradient overlays
   - Icon colors

#### Color Palette (Parallaxa):
- Primary: #7C3AED (Deep Purple)
- Primary Dark: #5B21B6 (Darker Purple)
- Secondary: #06B6D4 (Cyan)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Neutral: Grayscale

### 5.4 Replace Icons & Images ⏳
**Priority**: MEDIUM

#### Icon Updates:
1. App icon - Replace with Parallaxa logo
2. Splash screens - Update with new branding
3. Navigation icons - Update if needed
4. Feature icons - Ensure consistency

#### Files to Update:
- `assets/app-icons/*` - All app icons
- `assets/splash/*` - Splash screens
- `assets/favicon.png` - Web favicon
- Logo graphics

### 5.5 Update Onboarding & Auth Screens ⏳
**Priority**: HIGH

#### Auth Screens:
- Login form - Update styling
- Register form - Update styling
- Password reset - Update styling
- Email verification - Add if needed

#### Onboarding:
- Welcome screen - New copy/branding
- Tutorial screens - Update content
- Interests selection - Update UI
- Profile setup - Simplify for independent network

### 5.6 Update App Text & Copy ⏳
**Priority**: MEDIUM

#### File Locations:
- Error messages
- Success messages
- Placeholder text
- Help text
- About/Settings text

#### Key Phrases to Update:
- "Bluesky" → "Parallaxa"
- References to federation
- References to AT Protocol
- Help documentation

### 5.7 Test Authentication Integration ⏳
**Priority**: HIGH

#### Test Cases:
```
1. Register new user
   - Valid registration with new email/handle
   - Duplicate email error
   - Invalid password error
   - Invalid handle format

2. Login
   - Login with correct credentials
   - Invalid credentials error
   - Token storage/retrieval
   - Token in API requests

3. Profile access
   - Get own profile
   - Get other user profile
   - Update profile
   - Profile persistence

4. Session management
   - Token persistence across restarts
   - Token expiry handling
   - Logout functionality
   - Auto-logout on 401
```

## Phase 6: Testing & Deployment

### 6.1 End-to-End Testing ⏳
**Priority**: HIGH

#### Test Flows:
1. **Complete Auth Flow**
   - Register account
   - Verify user created in database
   - Login with new account
   - Verify token received
   - Verify auth header in requests

2. **Feed & Posts**
   - Create post
   - View own post in feed
   - Like post
   - Unlike post
   - Comment on post
   - Delete post

3. **User Interactions**
   - Follow user
   - View follower count update
   - Unfollow user
   - View profile of followed user

4. **Search**
   - Search users
   - Search posts
   - View trending posts

### 6.2 Platform Testing ⏳
**Priority**: HIGH

#### iOS Testing
- Build with EAS: `eas build --platform ios`
- Test on simulator and physical device
- Check app icons, splash screens
- Verify all features work

#### Android Testing
- Build with EAS: `eas build --platform android`
- Test on emulator and physical device
- Check app icons, splash screens
- Verify all features work

#### Web Testing
- Build web: `npm run build-web`
- Test in Chrome, Firefox, Safari
- Check responsive design
- Verify touch/mouse interactions

### 6.3 Performance Optimization ⏳
**Priority**: MEDIUM

#### Tasks:
1. Measure app startup time
2. Optimize image loading
3. Implement pagination for feeds
4. Add image caching
5. Optimize database queries
6. Remove unused dependencies
7. Code splitting optimization

### 6.4 Production Deployment ⏳
**Priority**: HIGH

#### Backend Deployment:
```bash
# Deploy to Vercel
vercel --cwd backend deploy --prod

# Or deploy to AWS/DigitalOcean/Heroku
# Set environment variables:
# - DATABASE_URL (production database)
# - JWT_SECRET (strong secret)
# - CORS_ORIGIN (production domain)
```

#### Frontend Deployment:
```bash
# Build for production
eas build --platform all --release

# Or build for web production
npm run build-web

# Submit to:
# - App Store (iOS)
# - Play Store (Android)
# - Deploy web to Vercel
```

#### Database Setup:
1. Provision production PostgreSQL:
   - Neon (recommended for Vercel)
   - AWS RDS
   - DigitalOcean
   - Other managed PostgreSQL service

2. Run migrations in production:
   ```bash
   DATABASE_URL=<production-url> npm run db:migrate
   ```

3. Backup and monitoring setup

### 6.5 Post-Launch Tasks ⏳
**Priority**: MEDIUM

#### Immediate:
- Monitor error logs (Sentry, etc.)
- Track performance metrics
- Respond to user feedback
- Fix critical bugs

#### Short-term:
- Implement analytics
- Set up monitoring/alerting
- Security audit
- Performance profiling

## Detailed Implementation Guide

### Removing ATProto Step-by-Step

#### 1. Audit Current Usage
```bash
# Find all ATProto usage
rg "@atproto|Agent|PLC|did:|AppBskyActor|AppBskyFeed" src/ --type ts --type tsx | head -20
```

#### 2. Replace Session Management
**File**: `src/state/session/index.tsx` (or similar)

Replace:
```typescript
// OLD
import { BskyAgent } from '@atproto/api'
const agent = new BskyAgent({ service: 'https://api.bsky.app' })

// NEW
import { setAuthToken, getAuthToken } from '@/lib/api/parallaxa-api'
// Use the token-based system instead
```

#### 3. Update Query Functions
**Files**: `src/state/queries/*.ts`

Replace:
```typescript
// OLD
const posts = await agent.getTimeline()

// NEW
const { posts } = await getFeed(20, 0)
```

#### 4. Clean Up Package Dependencies
```json
{
  "dependencies": {
    // REMOVE:
    "@atproto/api": "^0.19.8",
    "@atproto/oauth": "...",
    // KEEP everything else
  }
}
```

### Color Update Script

Create a script to help update colors:

```bash
#!/bin/bash
# Replace Bluesky blue with Parallaxa purple

# Find and replace hex colors
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
  -e 's/#006AFF/#7C3AED/g' \
  -e 's/#002861/#5B21B6/g' \
  -e 's/#0085FF/#7C3AED/g' \
  {} \;

echo "Color replacement complete. Review changes carefully!"
```

### Creating Parallaxa Logo & Icons

**Option 1: Use Design Tool**
- Figma, Adobe XD, or similar
- Design purple-themed logo
- Export as PNG/SVG

**Option 2: Use Icon Generator**
```bash
# Generate app icons from single design
npx @react-native-community/cli generate-app-icons ./logo.png
```

## Testing Checklist

- [ ] All pages load without errors
- [ ] Authentication flows work (register, login, logout)
- [ ] Can create and view posts
- [ ] Can like/unlike posts
- [ ] Can follow/unfollow users
- [ ] Search functionality works
- [ ] User profiles display correctly
- [ ] App icons show correct branding
- [ ] Splash screens have correct colors
- [ ] No @atproto imports remain
- [ ] No "Bluesky" references remain
- [ ] Purple theme applied throughout
- [ ] All buttons/links have correct styling
- [ ] Responsive design works on all screen sizes
- [ ] Performance is acceptable

## Estimated Time to Completion

- **Remove ATProto**: 2-3 days
- **Update Branding**: 2-3 days
- **Color Updates**: 1 day
- **Icons/Images**: 1-2 days
- **Testing**: 2-3 days
- **Deployment**: 1 day

**Total**: ~1-2 weeks

## Risk Mitigation

### High Risk Items
1. **Breaking changes from ATProto removal**
   - Solution: Keep git history, revert capability
   - Test incrementally, not all at once

2. **Database migration issues**
   - Solution: Backup production data
   - Test migrations in staging first

3. **Performance degradation**
   - Solution: Benchmark before/after
   - Monitor production metrics

### Contingency Plans
- Maintain backup branch of original code
- Keep staging environment for testing
- Have rollback plan ready
- Document all custom implementations

## Success Criteria

- ✅ App builds successfully for iOS, Android, and web
- ✅ All ATProto code removed
- ✅ No "Bluesky" references in app
- ✅ Purple theme applied throughout
- ✅ New app icons and splash screens display
- ✅ Authentication works with new backend
- ✅ All core features functional (posts, likes, follows, search)
- ✅ App performs well (< 3 second startup)
- ✅ Ready for App Store / Play Store submission

## Questions or Issues?

Refer to:
- **PARALLAXA_INTEGRATION.md** - Architecture & integration details
- **PARALLAXA_DEVELOPER_GUIDE.md** - Development processes
- **backend/README.md** - Backend API documentation
- **Commit history** - See what was changed and why
