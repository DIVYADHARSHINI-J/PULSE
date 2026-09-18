# PULSE – Real-Time Live Polling Tool

PULSE is a real-time polling application that allows users to create polls, share them with an audience, collect votes, and view live results.

## Features

- User signup and login
- Create polls with multiple options
- Share poll links
- Audience can vote without login
- Live result updates
- Vote percentages and total vote count
- Real-time communication using Redis and WebSocket
- MongoDB for storing users, polls, and votes
- Responsive and clean user interface

## Technology Stack

### Frontend
- React.js
- JavaScript
- CSS
- Vite

### Backend
- Go
- Gin Framework
- JWT Authentication
- WebSocket

### Database & Real-Time
- MongoDB Atlas
- Redis / Upstash Redis

## Architecture

React Frontend  
↓  
Go + Gin Backend  
↓  
MongoDB

For real-time updates:

Vote → Go Backend → MongoDB → Redis → WebSocket → React

## Live Demo

https://pulse-five-teal.vercel.app/

## Backend

https://pulse-or4d.onrender.com/

## Project Flow

1. User logs into PULSE.
2. User creates a poll.
3. PULSE generates a shareable poll link.
4. Audience opens the link and votes.
5. Vote is stored in MongoDB.
6. Redis publishes the poll update.
7. WebSocket sends the update to connected clients.
8. Live results update automatically.

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Redis: Upstash

## Author

DIVYADHARSHINI J