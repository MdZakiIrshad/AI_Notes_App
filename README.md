# Notes App

A simple notes application built with React, Express, and MongoDB.

## Project Overview
This project is a full-stack app where:
- the frontend is built with React and Vite
- the backend is built with Node.js and Express
- the database is MongoDB running in Docker

Users can create, view, edit, and delete notes. Each note is saved in MongoDB.

## Tech Stack
- Frontend: React
- Build tool: Vite
- Backend: Node.js + Express
- Database: MongoDB
- Containerization: Docker Compose

## Folder Structure

```bash
Notes_App/
├── client/         # React frontend
├── server/         # Express backend
├── docker-compose.yml
├── README.md
```

## How It Works

### Frontend
The React app provides the user interface for:
- adding a note
- editing a note
- deleting a note
- marking a note as favorite

### Backend
The Express server exposes API endpoints for:
- GET /api/notes
- POST /api/notes
- PUT /api/notes/:id
- DELETE /api/notes/:id

### Database
MongoDB stores all notes in a collection called `notes` using the `Note` model.

## MongoDB Setup
MongoDB is running through Docker Compose.

To start the database:

```bash
docker compose up -d
```

## Start the App

### 1. Start MongoDB
```bash
cd Notes_App
docker compose up -d
```

### 2. Start the backend
```bash
cd Notes_App\server
npm install
npm run dev
```

### 3. Start the frontend
```bash
cd Notes_App\client
npm install
npm run dev
```

Then open the local URL shown by Vite in the browser, usually:

```bash
http://localhost:5173
```

If port 5173 is already in use, Vite may choose a different port such as 5174 or 5175.

## Notes Model
Each note contains:
- title
- content
- favorite
- createdAt
- updatedAt

## Purpose
This app demonstrates how to connect:
- a React frontend
- a Node.js backend
- a MongoDB database
- Docker-based local database setup

It is a beginner-friendly example of a full-stack CRUD application.
