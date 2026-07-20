# QuizBoard

Welcome to QuizBoard. This is a full-stack quiz website where users can create an account, answer quizzes and see their score on a live leaderboard.

The project has a separate backend and frontend.

## What the project can do

- Sign up and log in with email and password
- Passwords are hashed with bcrypt
- Login uses a JWT token
- Edit the username and log out
- Choose from 10 quiz topics
- Answer one question at a time
- Show if an answer was correct and how many points were earned
- Prevent the same question from giving points more than once
- Show the top 20 users on the leaderboard
- Update the leaderboard with Socket.IO
- Show other users who are currently online
- Work on desktop and mobile screens

## Technologies

### Backend

- Node.js
- Express
- MongoDB and Mongoose
- Socket.IO
- Joi
- bcrypt
- JSON Web Token
- dotenv
- CORS

### Frontend

- Next.js with the App Router
- React
- Axios
- Socket.IO Client
- CSS

## Project structure

```text
Homework20/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- seed/
|   |   |-- services/
|   |   |-- sockets/
|   |   |-- validations/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- context/
|   |-- lib/
|   |-- .env.local.example
|   `-- package.json
`-- README.md
```

## How to run it

MongoDB has to be available before starting the project.

Install the backend packages:

```bash
cd Homework20/backend
npm install
```

Install the frontend packages:

```bash
cd ../frontend
npm install
```

Go back to the backend, add the quizzes and start the whole project:

```bash
cd ../backend
npm run seed
npm run dev
```

`npm run dev` starts both parts of the project. The website opens on:

```text
http://localhost:3000
```

The backend uses port `5000`, but it is started automatically and normally does not need to be opened in the browser.

## Environment variables

Backend `.env`:

```env
PORT=5000
MONGO_URL=your_mongodb_url
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Quiz data

The seed file contains 10 topics with 5 questions in every topic:

1. Technology
2. Geography
3. History
4. Science
5. Movies
6. Music
7. Literature
8. Sports
9. General knowledge
10. Mathematics

The seed can be run more than once without creating duplicate quizzes:

```bash
npm run seed
```

## API routes

### Authentication

| Method | Route                    | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/auth/sign-up`      | Create an account      |
| POST   | `/api/auth/sign-in`      | Log in                 |
| GET    | `/api/auth/current-user` | Get the logged-in user |

### Users and quizzes

| Method | Route              | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/api/users`       | Get users                            |
| GET    | `/api/users/:id`   | Get one user                         |
| PATCH  | `/api/users/:id`   | Change the logged-in user's username |
| GET    | `/api/quizzes`     | Get all quizzes                      |
| GET    | `/api/quizzes/:id` | Get one quiz                         |
| POST   | `/api/answers`     | Submit an answer                     |
| GET    | `/api/leaderboard` | Get the top 20 users                 |

Correct answers are removed from quiz GET responses. The backend checks the answer and calculates the real score.

## Socket.IO events

Events sent by the frontend:

- `user:online`
- `user:offline`
- `leaderboard:request`
- `online-users:request`

Events sent by the backend:

- `leaderboard:update`
- `online-users:update`

After a correct or incorrect answer is saved, the backend gets the updated leaderboard and sends it to every connected browser.

Online users are kept in memory by socket ID. If one user opens more than one tab, that user is shown only once. The user is removed after their last connection closes or after logging out.

## Answer history

Answer history is saved inside the user document. Before adding points, the backend checks the quiz ID and question index. The update is atomic, so the same user cannot receive points twice for the same question. A repeated answer returns status `409`.

## Build check

To check the frontend production build:

```bash
cd Homework20/frontend
npm run build
```
