# Notes App

A full-stack notes application built with React, Express, MongoDB, Docker, and local AI using Ollama.

## Overview
This project demonstrates how to build a beginner-friendly full-stack app with:
- React + Vite for the frontend
- Node.js + Express for the backend
- MongoDB for data storage
- Docker Compose for the database container
- Ollama for local AI-powered note suggestions

Users can create, edit, delete, favorite, and organize notes. The app also includes AI actions to generate a note title, summary, and tags using a local model.

## Tech Stack
- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB
- Containerization: Docker Compose
- AI: Ollama with `llama3.2`

## Folder Structure

```bash
Notes_App/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── models/
│   ├── index.js
│   ├── .env
│   └── package.json
├── docker-compose.yml      # MongoDB container config
├── README.md
└── .gitignore
```

## Features
- Add new notes
- Edit existing notes
- Delete notes
- Mark notes as favorite
- View all notes in a responsive card layout
- AI-generated title
- AI-generated summary
- AI-generated tags
- Dark mode toggle

## Backend API
The server runs on port `5000` and exposes these routes:

- `GET /api/notes` - fetch all notes
- `POST /api/notes` - create a new note
- `PUT /api/notes/:id` - update a note
- `DELETE /api/notes/:id` - delete a note
- `POST /api/ai/suggest` - generate title, summary, or tags from note content

## MongoDB Setup
The MongoDB database is run with Docker Compose.

### Start the database

```bash
docker compose up -d
```

This creates a MongoDB instance with the database name:

```bash
notesdb
```

The connection string is configured in the backend `.env` file as:

```bash
MONGO_URI=mongodb://localhost:27017/notesdb
```

## Local AI Setup (Ollama)
This project uses a free local AI setup instead of a paid API key.

### Requirements
1. Install Ollama from: https://ollama.com
2. Pull the model used by the app:

```bash
ollama pull llama3.2
```

3. Ensure Ollama is running locally on:

```bash
http://localhost:11434
```

The backend reads the model information from:

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
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
npm run dev -- --host 0.0.0.0
```

Then open the URL shown in the terminal, usually:

```bash
http://localhost:5173
```

If port 5173 is busy, Vite may choose a different available port.

## Notes Model
Each note contains:
- `title`
- `content`
- `favorite`
- `tags`
- `createdAt`
- `updatedAt`

## Example Workflow
1. Start Docker MongoDB
2. Start the backend
3. Start the frontend
4. Create a note
5. Use the AI buttons to generate a title, summary, or tags
6. Save the note to MongoDB

## Purpose
This app is a practical learning project for:
- full-stack development
- REST APIs
- MongoDB integration
- Docker container usage
- frontend-backend communication
- local AI integration without paid API services

## Notes
- The `.env` file is intentionally ignored by Git for security.
- Keep Ollama installed if you want to use AI features locally.
- The app is designed as a learning project and can be extended with search, filters, user auth, or categories.
