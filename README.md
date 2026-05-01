# TaskFlow

TaskFlow is a full-stack task management application with role-based access control.

## Features

- **Authentication**: JWT-based Signup/Login.
- **Role-Based Access**: Separation of Admin and Member privileges.
- **Project Management**: Create, view, update, and delete projects.
- **Task Management**: Create tasks, assign them to team members, and update their statuses in a Kanban board.
- **Dashboard**: Track overall task statistics and overdue items.
- **Audit Trail**: Real-time activity logging.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)

## Setup

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with `MONGODB_URI` and `JWT_SECRET`
4. Run `npm run dev` to start the server

The application will be running at `http://localhost:3000`.

## Default Demo Accounts

If running with an empty database, the application automatically seeds two test accounts:
- **Admin**: `admin@taskflow.io` / `admin123`
- **Member**: `member@taskflow.io` / `member123`
