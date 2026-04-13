# Parallaxa Backend API

Independent social network backend service built with Express.js, PostgreSQL, and Drizzle ORM.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Installation

```bash
npm install
# or
yarn install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update the following variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Strong secret key for JWT tokens
   - `CORS_ORIGIN`: Frontend URL(s)

### Database Setup

```bash
# Generate migrations
npm run build

# Run migrations (requires database to exist)
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3001`

Health check: `GET /health`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login to account

### Users
- `GET /api/v1/users/:handle` - Get user profile
- `PATCH /api/v1/users/me` - Update profile (requires auth)
- `POST /api/v1/users/:userId/follow` - Follow user (requires auth)
- `DELETE /api/v1/users/:userId/follow` - Unfollow user (requires auth)

### Posts
- `GET /api/v1/posts/feed` - Get feed (requires auth)
- `POST /api/v1/posts` - Create post (requires auth)
- `DELETE /api/v1/posts/:postId` - Delete post (requires auth)
- `POST /api/v1/posts/:postId/like` - Like post (requires auth)
- `DELETE /api/v1/posts/:postId/like` - Unlike post (requires auth)
- `POST /api/v1/posts/:postId/comments` - Add comment (requires auth)

## Database Schema

### Tables
- `users` - User accounts
- `posts` - User posts
- `likes` - Post likes
- `comments` - Post comments
- `follows` - User follow relationships

## Architecture

- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Password Hashing**: bcryptjs

## Security

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- CORS is configured per environment
- Input validation on all endpoints
- Password strength requirements enforced

## Error Handling

All endpoints return consistent JSON error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 500: Server error
