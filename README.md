# TaskFlow

A modern task management app with RBAC, realtime kanban, and 3D interactions.
Built with Node.js, Express, MongoDB, and vanilla JS on the frontend.

## Features
- **Auth & RBAC**: Admins create projects/users. Members only see tasks assigned to them.
- **Kanban**: Drag and drop tasks across columns.
- **UI/UX**: Glassmorphism UI, 3D tilt effects, page transitions (anime.js), and canvas confetti.
- **Mobile**: Expo Go ready mobile app in the `/mobile` directory.

## Local Setup
1. `npm i`
2. Create `.env` and add `MONGODB_URI` and `JWT_SECRET`
3. `npm start`
4. Go to `http://localhost:3000`

### Demo Users
- admin@taskflow.io / admin123
- member@taskflow.io / member123
