# ClickRush

ClickRush is a simple 60-second clicking game. The main goal is to click as many times as possible before the timer ends.

The project has user login/register, game history, scores, leaderboards and different difficulty modes.

## Tech Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Axios
- Lucide React
- Socket.IO

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/GirishChauhan15/clickrush
cd ClickRush
```

### 2. Backend setup

Go into the backend folder:

```bash
cd backend
```

Install the packages:

```bash
npm i
```

Create a `.env` file in the backend folder.

```env
PORT=5000

MONGO_URI=MongodbUri

JWT_SECRET=secretToken

CLIENT_URL=http://localhost:5173

NODE_ENV=development

ACCESS_TOKEN_MINUTES=15

REFRESH_TOKEN_DAYS=2

COOKIE_SECURE=false

COOKIE_SAME_SITE=lax
```

Replace `MongodbUri` with your MongoDB Atlas connection string.

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Frontend setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
```

Install the packages:

```bash
npm i
```

Create a `.env` file in the frontend folder.

```env
VITE_API_URL=http://localhost:5000/api

VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

## Database

MongoDB Atlas is used for the database.

There are mainly three models used in the application.

### User

The user collection stores account information.

Some important fields are:

- `name`
- `email`
- `password`
- `nationality`
- `highScores`

The password is hashed before it is stored in the database.

### Game

The game collection stores every completed game.

Important fields are:

- `userId`
- `mode`
- `accuracy`
- `correctClicks`
- `incorrectClicks`
- `score`
- `createdAt`

Each game is connected to the user who played it using `userId`.

### RefreshToken

Refresh tokens are stored separately.

The refresh token is hashed before storing it in the database. This is used to manage login sessions and refresh expired access tokens.

## Game Modes

ClickRush currently has three modes:

- Easy
- Medium
- Hard

Each mode has different scoring difficulty.

The game lasts for 60 seconds and the final score is submitted to the backend after the game finishes.

## API Endpoints

The main API routes are below.

### Authentication

#### Register

```http
POST /api/auth/register
```

Creates a new user.

Request body:

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "Password@123"
}
```

#### Login

```http
POST /api/auth/login
```

Logs the user in and returns an access token.

#### Refresh Token

```http
POST /api/auth/refresh
```

Creates a new access token using the refresh cookie.

#### Logout

```http
POST /api/auth/logout
```

Logs out the current session.

#### Logout From All Devices

```http
POST /api/auth/logout-all
```

Revokes all active refresh sessions for the user.

#### Current User

```http
GET /api/auth/me
```

Returns the currently logged-in user.

#### Update Nationality

```http
PATCH /api/auth/update-nationality
```

Updates the user's nationality.

Example:

```json
{
  "nationality": "IN"
}
```

## Game APIs

### Submit Game

```http
POST /api/games/submit
```

Stores a completed game in the database.

Example request:

```json
{
  "mode": "easy",
  "accuracy": 80,
  "correctClicks": 40,
  "incorrectClicks": 10,
  "score": 3500
}
```

The backend also checks the submitted values before saving the game.

If the score is higher than the user's current high score for that mode, the high score is updated.

### Game History

```http
GET /api/games/history
```

Returns the logged-in user's previous games.

### Game Stats

```http
GET /api/games/stats
```

Returns basic statistics like:

- Best score
- Number of games
- Total correct clicks
- Total incorrect clicks

## Leaderboard APIs

### Leaderboard

```http
GET /api/leaderboards?period=global&mode=easy
```

The leaderboard supports:

- `global`
- `daily`
- `weekly`

And the modes:

- `easy`
- `medium`
- `hard`

Example:

```text
/api/leaderboards?period=weekly&mode=hard
```

The leaderboard returns the highest qualifying score from each player.

### My Rank

```http
GET /api/leaderboards/me?period=global&mode=easy
```

Returns the logged-in user's current rank for the selected period and mode.

Example:

```text
/api/leaderboards/me?period=daily&mode=medium
```

## Authentication

The application uses JWT access tokens and refresh tokens.

The access token is stored on the frontend and sent with API requests using the `Authorization` header.

The refresh token is stored using an HTTP cookie.

When an access token expires, the frontend tries to refresh it and then retries the original request.

## Leaderboard Logic

For the leaderboard, games are first filtered by the selected period and game mode.

Then the highest score of each player is selected.

The players are sorted by score and a rank is assigned.

The leaderboard supports different minimum qualifying scores depending on the period.

## Real-Time Updates

Socket.IO is used for leaderboard updates.

When a new game is submitted, the backend sends a leaderboard update event.

This allows the frontend to know that leaderboard data may have changed without manually refreshing the whole page.

## Running the Project

After setting up both sides, run the backend and frontend in separate terminals.

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Then open the frontend URL shown by Vite in the terminal.

## Demo

Live Demo:

```text
  https://clickrush-frontend.vercel.app/
```

Demo Video:

```text
  https://drive.google.com/file/d/1pSGmNl1jM8OplgeQcsDQQFz6RL4xYSR-/view?usp=drive_link
```
