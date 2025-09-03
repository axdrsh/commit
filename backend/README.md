# programmer matching app: backend roadmap

this roadmap outlines the backend development for a programmer matching app using node.js/express, typescript, postgresql, and prisma. the process is divided into five phases.

## phase 1: project setup & user authentication

**goal:** establish the project foundation, connect to the database, and implement core user sign-up and login functionality.

### initialize project:

[x] set up a new node.js project (`npm init`).
[x] install dependencies: `express`, `typescript`, `@types/node`, `@types/express`, `ts-node`, `nodemon`.
[x] configure `tsconfig.json` for a node.js environment.
[x] create a basic express server in `src/index.ts`.

### database & prisma setup:

[x] install prisma (`npm install prisma --save-dev`).
[x] initialize prisma with the postgresql provider (`npx prisma init`).
[x] define the `user` model in `prisma/schema.prisma` with fields like `id`, `email`, `password`, `name`, `createdAt`.
[x] run `npx prisma migrate dev` to sync your schema with the database.

### authentication logic:

[x] install `bcrypt` for password hashing and `jsonwebtoken` for session management.
[x] **registration (`/auth/register`)**: create an endpoint that accepts user details, hashes the password with bcrypt, and uses prisma client to save the new user to the database.
[x] **login (`/auth/login`)**: create an endpoint that validates credentials. find the user by email, compare the provided password with the stored hash using bcrypt. if valid, generate a jwt.
[x] **auth middleware**: create an express middleware that verifies the jwt from the authorization header on protected routes.

## phase 2: user profiles & tech stack

**goal:** allow users to manage their profiles and add their tech stack.

### extend database schema:

[x] update `prisma/schema.prisma`.
[x] add a `technology` model (`id`, `name`, `type` e.g., 'language', 'framework', 'database').
[x] establish a many-to-many relationship between `user` and `technology` to track skills.
[x] add profile fields to the `user` model (`bio`, `age`, `gender`, `yearsOfExperience`, `role`, `githubUrl`).
[x] run `npx prisma migrate dev`.

### manage technology data:

[x] create a seed script to pre-populate the `technology` table with a comprehensive list of programming languages, frameworks, and tools.

- build an endpoint (`/api/technologies`) for the frontend to fetch the list of available technologies to add to a profile.

### profile endpoints:

[x] **put `/api/profile`**: update a user's profile information.
[x] **get `/api/profile/:userId`**: fetch a specific user's viewable profile.

- **post `/api/profile/tech`**: add a technology to the user's tech stack.
- **delete `/api/profile/tech/:techId`**: remove a technology from the tech stack.

## phase 3: swiping & matching logic

**goal:** implement the core like/dislike functionality and create matches when two users mutually like each other.

### schema for swipes:

- create a `like` model in `prisma/schema.prisma`.
  - fields: `id`, `likerId`, `likedId`, `createdAt`.
- run `npx prisma migrate dev`.

### user discovery endpoint:

- **get `/api/users/discover`**: return a list of potential profiles for the current user to swipe on.

### swipe & match logic:

- **post `/api/like`**: create an authenticated endpoint to handle user likes. check if a "reverse" like exists to detect matches.

### schema and logic for matches:

- create a `match` model in `prisma/schema.prisma`.
  - fields: `id`, `userAId`, `userBId`.
- create an endpoint to fetch matches: **get `/api/matches`**.

## phase 4: real-time chat

**goal:** enable real-time messaging between matched users.

### technology:

- use `socket.io` for real-time communication.

### chat schema:

- create a `message` model in `prisma/schema.prisma`.
  - fields: `id`, `content`, `createdAt`, `senderId`, `matchId`.
- run `npx prisma migrate dev`.

### socket.io server setup:

- integrate `socket.io` with express.
- implement middleware for jwt authentication.
- users automatically join socket rooms for each of their matchids.

### event handling:

- handle `sendMessage` event and broadcast messages to the matchid room.

### chat history endpoint:

- **get `/api/matches/:matchId/messages`**: fetch the message history for a chat.

## phase 5: advanced matching & deployment prep

**goal:** refine the matching algorithm to use tech stack data and prepare the application for a production environment.

### tech-stack-based matching algorithm:

- enhance `get /api/users/discover` to calculate a "compatibility score" based on shared technologies.
  - scoring formula: `(number of common technologies / total technologies of user a) * 100`.

### production hardening:

- **environment variables**: use a `.env` file for secrets (database connection string, jwt secret).
- **cors**: configure cors to accept requests from the frontend url.
- **input validation**: use a library like `zod` to validate incoming request bodies and parameters.
- **global error handling**: implement centralized error-handling middleware.

### deployment:

- **containerization**: write a dockerfile to containerize the node.js application.
- **hosting**: choose a platform to host the backend and database (e.g., render, fly.io, railway, aws).
- **ci/cd**: set up ci/cd using github actions to automatically deploy on changes.
