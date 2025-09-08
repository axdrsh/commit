# commit <3

note: this is just the backend, i lost interest in coding the frontend. <br />
**Stack:** Node.js + Express + TypeScript + PostgreSQL + Prisma + Socket.IO + JWT

## Setup

```bash
npm install
# Create .env: DATABASE_URL + JWT_SECRET
npx prisma migrate dev && npm run seed
npm run dev  # localhost:3000
```

## Core API Endpoints

**Auth:**

- `POST /auth/register` - Register user
- `POST /auth/login` - Login (returns JWT token)

**Profile:** (All require `Authorization: Bearer <token>`)

- `PUT /profile` - Update profile
- `GET /profile/:userId` - Get user profile
- `POST /profile/tech` - Add technology to profile
- `DELETE /profile/tech/:techId` - Remove technology
- `GET /profile/users/discover` - Get potential matches (sorted by compatibility)
- `POST /profile/picture` - Upload profile picture
- `DELETE /profile/picture` - Delete profile picture

**Tech Stack:**

- `GET /api/technologies` - Get all available techs (languages, frameworks, databases, tools)

**Matching:**

- `POST /api/like` - Like user (creates match if mutual)
- `GET /api/matches` - Get all user matches

**Chat:**

- `GET /api/chat` - Get chat list
- `GET /api/chat/:matchId/messages` - Get message history

## Socket.IO Events (Real-time Chat)

**Send:**

- `joinMatch` - Join match room
- `sendMessage` - Send message to match

**Receive:**

- `joinedMatch` - Joined room confirmation
- `newMessage` - New message received
- `error` - Error messages

## How It Works

1. Users register/login with email/password
2. Build profiles with bio, tech stack, and photos
3. Discover other users ranked by shared technologies
4. Swipe (like/pass) on profiles
5. Match when both users like each other
6. Real-time chat with matched users


