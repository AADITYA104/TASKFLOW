# TaskFlow

A simple, real-time task management application for teams.

TaskFlow is built to help teams organize projects, track tasks, and collaborate. It uses a Kanban-style board and role-based access control to keep things structured.

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=TaskFlow+Preview)

## Features

- **Authentication**: JWT-based login and signup.
- **Role-Based Access**: Distinguishes between Admin (can manage projects/team) and Member roles.
- **Kanban Board**: Simple drag-and-drop interface for moving tasks between To Do, In Progress, and Done.
- **Dashboard**: Quick overview of overdue tasks and basic visual analytics (Chart.js).
- **Projects**: Group tasks by project.
- **Real-Time Sync**: Uses Socket.io to keep clients updated when tasks change.
- **Command Palette**: Press `CMD+K` / `CTRL+K` for global search and quick actions.
- **Activity Logging**: Tracks recent changes to tasks and projects.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT, bcryptjs

## Setup & Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/AADITYA104/TASKFLOW.git
cd TASKFLOW
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 4. Seed the Database (Optional)
This creates some sample projects, tasks, and two default users.
```bash
node seed.js
```
Default accounts created:
- **Admin**: `admin@taskflow.io` / `admin123`
- **Member**: `member@taskflow.io` / `member123`

### 5. Start the app
```bash
npm run dev
```
Open your browser to `http://localhost:3000`.

## Deployment

The repository includes a `render.yaml` file for easy deployment to Render. Just connect your GitHub repo and the web service should automatically configure itself. Make sure to set your environment variables (`MONGODB_URI` and `JWT_SECRET`) in the Render dashboard.

## License
ISC
