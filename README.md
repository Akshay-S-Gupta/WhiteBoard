# Collaborative Whiteboard

## Progress
- [x] Project structure and setup (MERN + Socket.io)
- [x] Room management (join/create with code)
- [x] Real-time drawing and cursor sync
- [x] Adjustable color and stroke width
- [x] User presence and user count display
- [x] Drawing history persistence and replay
- [x] Modern, responsive UI (all inline CSS removed)
- [x] Room code copy button
- [x] API and socket event documentation
- [x] Deployment and troubleshooting guides

## Project Overview
A real-time collaborative whiteboard application using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Socket.io for live collaboration.

---

## Features
- **Room Management:** Join or create a room with a simple code (6-8 alphanumeric characters, no login required)
- **Drawing:** Smooth pencil tool, adjustable color and stroke width, clear canvas
- **Live Collaboration:** Real-time drawing and cursor sync across all users in a room
- **User Presence:** See the number of active users in the room
- **Persistence:** Drawing history is saved and replayed for new users
- **Modern UI:** Clean, responsive, and user-friendly interface

---

## Architecture Overview

**Frontend (React):**
- Handles UI, drawing logic, and real-time socket communication.
- Connects to backend via REST for room management and via Socket.io for live collaboration.
- Main components: `RoomJoin`, `Whiteboard`, `DrawingCanvas`, `Toolbar`, `UserCursors`.

**Backend (Node.js + Express):**
- Provides REST API for room management.
- Handles Socket.io events for real-time drawing, cursor, and presence sync.
- Persists drawing data in MongoDB for replay and history.

**Database (MongoDB):**
- Stores rooms and their drawing history as arrays of drawing commands.

**Data Flow:**
- User joins/creates a room (REST API), then connects via Socket.io.
- Drawing/cursor events are sent in real time to all users in the room.
- Completed strokes are persisted to MongoDB for replay.

---

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB (local or Atlas)

### Backend Setup
1. Open a terminal in the `server` directory:
   ```sh
   cd server
   npm install
   ```
2. Create a `.env` file in `server/` (optional, for custom MongoDB URI):
   ```env
   MONGO_URI=mongodb://localhost:27017/whiteboard
   ```
3. Start the backend server:
   ```sh
   node server.js
   # or for development with auto-reload:
   npx nodemon server.js
   ```

### Frontend Setup
1. Open a terminal in the `client` directory:
   ```sh
   cd client
   npm install
   npm start
   ```
2. The React app will run on [http://localhost:3000](http://localhost:3000)

---

## Usage
1. Open the app in your browser.
2. Enter a room code (6-8 alphanumeric characters) to join or create a room.
3. Draw on the canvas, adjust color/width, and clear as needed.
4. Open the same room in another tab/device to collaborate in real time.

---

## API Documentation

### REST Endpoints
- `POST /api/rooms/join` — Join or create a room
- `GET /api/rooms/:roomId` — Get room info

### Socket Events
- `join-room` — User joins a room
- `leave-room` — User leaves a room
- `cursor-move` — Cursor position update
- `draw-start` — Start drawing stroke (real-time only)
- `draw-move` — Drawing path data (real-time only)
- `draw-end` — End drawing stroke (full stroke is persisted)
- `clear-canvas` — Clear entire canvas

---

## Database Schema (MongoDB)
**Room Schema:**
```js
{
  roomId: String (unique),
  createdAt: Date,
  lastActivity: Date,
  drawingData: [DrawingCommand]
}
```
**DrawingCommand Schema:**
```js
{
  type: 'stroke' | 'clear',
  data: {
    // For 'stroke':
    color: String,
    width: Number,
    points: [{ x: Number, y: Number }]
    // For 'clear': {}
  },
  timestamp: Date
}
```

---

## Deployment Guide

### 1. Build the Frontend
```sh
cd client
npm run build
```
This creates a production-ready build in `client/build`.

### 2. Serve the Frontend with the Backend (Optional)
- You can use a static file server (e.g., [serve](https://www.npmjs.com/package/serve)) or configure Express to serve the `build` folder.
- Example (add to `server.js`):
  ```js
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
  ```

### 3. Set Environment Variables
- Set `MONGO_URI` in your environment or `.env` file for production MongoDB.
- Optionally set `PORT` for the backend server.

### 4. Deploy
- Deploy the backend (and optionally the frontend build) to your preferred platform (Heroku, Render, DigitalOcean, AWS, etc.).
- Make sure MongoDB is accessible from your deployment environment.

---

## Troubleshooting
- **500 Internal Server Error on join:**
  - Your database may contain old/invalid room data. Delete all rooms:
    ```sh
    mongo
    use whiteboard
    db.rooms.deleteMany({})
    ```
- **Drawings not in sync for new users:**
  - Make sure you are running the latest code (full strokes are now persisted and replayed).
- **MongoDB not running:**
  - Start MongoDB locally or use MongoDB Atlas.

---

## Directory Structure
```
project-root/
├── client/                      # React frontend
│   ├── public/                  # Static assets (index.html, manifest.json, robots.txt)
│   ├── src/
│   │   ├── components/          # Main React components
│   │   │   ├── DrawingCanvas.js     # Canvas drawing logic and socket sync
│   │   │   ├── RoomJoin.js          # Room code input/landing page
│   │   │   ├── Toolbar.js           # Drawing controls (color, width, clear)
│   │   │   ├── UserCursors.js       # Real-time cursor display
│   │   │   ├── Whiteboard.js        # Main whiteboard page
│   │   │   ├── RoomJoin.css         # Landing page styles
│   │   │   ├── Toolbar.css          # Toolbar styles
│   │   │   └── Whiteboard.css       # Whiteboard page styles
│   │   ├── App.js               # App entry point
│   │   ├── App.css
│   │   ├── App.test.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .gitignore               # Git ignore rules for client
│   └── node_modules/
├── server/                      # Node.js backend
│   ├── models/
│   │   └── Room.js              # Mongoose schema for rooms and drawing data
│   ├── routes/
│   │   └── rooms.js             # REST API endpoints for room management
│   ├── socket/
│   │   └── whiteboard.js        # Socket.io event handlers
│   ├── package.json
│   ├── package-lock.json
│   ├── .gitignore               # Git ignore rules for server
│   ├── server.js                # Express app entry point
│   └── node_modules/
├── .gitignore                   # Root git ignore rules
├── README.md                    # Project documentation
└── package.json                 # Root package (optional, for monorepo tools)
```