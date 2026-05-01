<div align="center">
  <h1>🚀 TaskFlow</h1>
  <p><strong>Premium Team Task Manager with Glassmorphism UI & Role-Based Access</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue.svg)](#)
</div>

---

## 📸 Screenshots
*(Add your screenshots here)*
- **Dashboard:** `[Link to screenshot]`
- **Kanban Board:** `[Link to screenshot]`

## 🌟 Key Features
- **Frontend**: Vanilla JS + CSS (Glassmorphism, 3D Hover Tilt, Ripple Effects, Chart.js)
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB + Mongoose
- **Authentication**: Secure JWT & `bcryptjs`
- **Role-Based Access**: 
  - **Admin**: Full access (manage projects, tasks, team).
  - **Member**: Limited access (only manage assigned tasks).

## 🛠️ API Documentation

### Auth
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Authenticate user

### Projects (Admin Only)
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks
- `GET /api/tasks` - Get tasks (Filtered by user role)
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update task (Admin or Assigned User)
- `DELETE /api/tasks/:id` - Delete task (Admin Only)

---

## 🚀 How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=super_secret_key_123
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **View the App**
   Open your browser and navigate to: `http://localhost:3000`

---

## 🌍 How to Deploy (Render.com)
1. Create a free account on [Render.com](https://render.com).
2. Create a new **Web Service** and connect this GitHub repo.
3. Use `npm install` for Build Command and `npm start` for Start Command.
4. Add `MONGODB_URI` and `JWT_SECRET` in **Environment Variables**.
5. Deploy and get your live URL!

*Designed & Built for Premium Productivity.*
