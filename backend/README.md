# Dating App: Backend Roadmap

This roadmap outlines the development process for the dating app backend using Node.js/Express, TypeScript, PostgreSQL, and Prisma. The process is divided into five phases.

## Phase 1: Project Setup & User Authentication

**Goal:** Establish the project foundation, connect to the database, and implement core user sign-up and login functionality.

### Initialize Project:

[x] Set up a new Node.js project (`npm init`).
[x] Install dependencies: `express`, `typescript`, `@types/node`, `@types/express`, `ts-node`, `nodemon`.
[x] Configure `tsconfig.json` for a Node.js environment.
[x] Create a basic Express server in `src/index.ts`.

### Database & Prisma Setup:

[x] Install Prisma (`npm install prisma --save-dev`).
[x] Initialize Prisma with the PostgreSQL provider (`npx prisma init`).
[x] Define the User model in `prisma/schema.prisma` with fields like `id`, `email`, `password`, `name`, `createdAt`.
[x] Run `npx prisma migrate dev` to sync your schema with the database.

### Authentication Logic:

[x] Install `bcrypt` for password hashing and `jsonwebtoken` for session management.
[x] **Registration (`/auth/register`)**: Create an endpoint that accepts user details, hashes the password with bcrypt, and uses Prisma Client to save the new user to the database.
[x] **Login (`/auth/login`)**: Create an endpoint that validates credentials. Find the user by email, compare the provided password with the stored hash using bcrypt. If valid, generate a JWT.
[x] **Auth Middleware**: Create an Express middleware that verifies the JWT from the Authorization header on protected routes.

## Phase 2: User Profiles & Movie Preferences

**Goal:** Allow users to manage their profiles and add their favorite movies.

### Extend Database Schema:

[x] Update `prisma/schema.prisma`.
[x] Add a Movie model (`id`, `tmdbId`, `title`, `posterPath`).
[x] Establish a many-to-many relationship between User and Movie to track favorites.
[x] Add profile fields to the User model (bio, age, gender, profilePictureUrl).
[x] Run `npx prisma migrate dev`.

### Integrate Movie Data:

- Choose an external API for movie data (e.g., TMDb).
- Create a service to handle fetching data from this API.
- Build an endpoint (`/api/movies/search`) to allow the frontend to search for movies to add to the profile.

### Profile Endpoints:

[x] **PUT `/api/profile`**: Update a user's profile information.
[x] **GET `/api/profile/:userId`**: Fetch a specific user's viewable profile.

- **POST `/api/profile/movies`**: Add a movie to the user's favorites.
- **DELETE `/api/profile/movies/:movieId`**: Remove a movie from the favorites.

## Phase 3: Swiping & Matching Logic

**Goal:** Implement the core like/dislike functionality and create matches when two users mutually like each other.

### Schema for Swipes:

- Create a `Like` model in `prisma/schema.prisma`.
  - Fields: `id`, `likerId`, `likedId`, `createdAt`.
- Run `npx prisma migrate dev`.

### User Discovery Endpoint:

- **GET `/api/users/discover`**: Return a list of potential profiles for the current user to swipe on.

### Swipe & Match Logic:

- **POST `/api/like`**: Create an authenticated endpoint to handle user likes. Check if a "reverse" like exists to detect matches.

### Schema and Logic for Matches:

- Create a `Match` model in `prisma/schema.prisma`.
  - Fields: `id`, `userAId`, `userBId`.
- Create an endpoint to fetch matches: **GET `/api/matches`**.

## Phase 4: Real-Time Chat

**Goal:** Enable real-time messaging between matched users.

### Technology:

- Use `socket.io` for real-time communication.

### Chat Schema:

- Create a `Message` model in `prisma/schema.prisma`.
  - Fields: `id`, `content`, `createdAt`, `senderId`, `matchId`.
- Run `npx prisma migrate dev`.

### Socket.io Server Setup:

- Integrate `socket.io` with Express.
- Implement middleware for JWT authentication.
- Users automatically join socket rooms for each of their matchIds.

### Event Handling:

- Handle `sendMessage` event and broadcast messages to the matchId room.

### Chat History Endpoint:

- **GET `/api/matches/:matchId/messages`**: Fetch the message history for a chat.

## Phase 5: Advanced Matching & Deployment Prep

**Goal:** Refine the matching algorithm to use movie data and prepare the application for a production environment.

### Movie-Based Matching Algorithm:

- Enhance `GET /api/users/discover` to calculate a "compatibility score" based on shared favorite movies.
  - Scoring formula: `(Number of Common Movies / Total Movies of User A) * 100`.

### Production Hardening:

- **Environment Variables**: Use a `.env` file for secrets (database connection string, JWT secret, external API keys).
- **CORS**: Configure CORS to accept requests from the frontend URL.
- **Input Validation**: Use a library like `zod` to validate incoming request bodies and parameters.
- **Global Error Handling**: Implement centralized error-handling middleware.

### Deployment:

- **Containerization**: Write a Dockerfile to containerize the Node.js application.
- **Hosting**: Choose a platform to host the backend and database (e.g., Render, Fly.io, Railway, AWS).
- **CI/CD**: Set up CI/CD using GitHub Actions to automatically deploy on changes.
