# TaskFlow

TaskFlow is a full-stack task management application with role-based access control.

## Features

- **Authentication**: JWT-based Signup and Login.
- **Role-Based Access Control**: Separation of privileges between Admin and Member roles.
- **Dashboard**: Overdue task tracking and visual charts using Chart.js.
- **Kanban Board**: Drag and Drop task status updates.
- **Projects**: Create and track projects.
- **Real-Time Updates**: Socket.io integration to sync UI across clients.
- **Command Palette**: Press `CMD+K` / `CTRL+K` for global search and quick actions.
- **Activity Log**: Audit trail for task and project changes.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/TaskFlow.git
   cd TaskFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. Run the app:
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:3000`.

## Testing

If you run `node seed.js` in the root directory, it will clear the database and populate it with initial mock data, including two default accounts:
- **Admin**: `admin@taskflow.io` / `admin123`
- **Member**: `member@taskflow.io` / `member123`
