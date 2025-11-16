# Trello-Lite

**Live Preview**: `https://trello-lite-six.vercel.app/dashboard`

## Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or a cloud MongoDB URI

## Install Dependencies
- Frontend: `cd frontend/trello-lite-frontend` then `npm install`
- Backend: `cd backend` then `npm install`

## Configure Backend Environment
- Create a `.env` file in `backend` with:
  - `PORT=1000`
  - `MONGO_URI=<your-mongodb-connection-string>`
- Optional: adjust CORS in `backend/app.js` for local dev if needed (e.g., `origin: "http://localhost:3000"`).

## Run Locally
- Start backend (from `backend`): `node app.js` or `npx nodemon app.js`
- Start frontend (from `frontend/trello-lite-frontend`): `npm run dev`
- Open the app: `http://localhost:3000` (frontend calls API at `http://localhost:1000/api/v1`)

## Build Production Assets
- Frontend (from `frontend/trello-lite-frontend`): `npm run build` then `npm start`

## Notes
- If the frontend switches to a different port (e.g., 3001), use that URL in the browser.
- Ensure the backend is reachable at `http://localhost:1000`; update `src/api/client.ts` if you change the backend port.

 

## Features
- Project dashboard with owner and members overview
- Task board with columns: `todo`, `in_progress`, `done`
- Drag-and-drop task reordering and status changes
- Task creation with `title`, `description`, `assignee`, `dueDate`
- Task editing and deletion
- Project members management (add/remove, roles)
- Auth flow with login, protected routes, and logout

## Screenshots
- Login
  - ![Login](https://raw.githubusercontent.com/prathmesh-lohar/Trello-Lite/main/screenshot/login.PNG)
- Project Dashboard
  - ![Dashboard](https://raw.githubusercontent.com/prathmesh-lohar/Trello-Lite/main/screenshot/Dashboard.PNG)
- Create Project
  - ![Create Project](https://raw.githubusercontent.com/prathmesh-lohar/Trello-Lite/main/screenshot/createproject.PNG)
- Task Board
  - ![Task Board](https://raw.githubusercontent.com/prathmesh-lohar/Trello-Lite/main/screenshot/taskboard.PNG)

