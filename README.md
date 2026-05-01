<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="Node" width="80" height="80"/>
  <h1>🌌 TaskFlow Premium</h1>
  <p><strong>Next-Generation Team Task Manager with Glassmorphism UI & Role-Based Access</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
</div>

---

## ✨ Overview
TaskFlow Premium is an enterprise-grade, highly attractive, and fully functional task management platform. It features an utterly unique, buttery-smooth **Glassmorphic** UI, complete with dynamic ambient backgrounds, state-of-the-art custom cursor tracking, and fluid 3D card animations. 

Everything runs flawlessly out of the box with zero configuration required.

## 🔑 Demo Access (Seeded Data)

The application automatically seeds a clean database with sample projects, real-time tasks, and pre-configured accounts so you can evaluate it instantly without registering.

### 👑 Administrator Account
- **Email:** `admin@taskflow.io`
- **Password:** `admin123`
- *Privileges: Full access to all projects, tasks, and team management dashboards.*

### 👤 Member Account
- **Email:** `member@taskflow.io`
- **Password:** `member123`
- *Privileges: Limited to assigned tasks, basic Kanban operations, and personalized dashboards.*

---

## 🌟 Premium Features

- **Next-Gen UI/UX**: Ultra-modern deep dark theme with vibrant neon glassmorphism and real-time noise overlay.
- **Fluid Micro-interactions**: Bespoke cursor follower, magnetic buttons, and 3D tilt hover effects.
- **Automated Seeding**: Instantly populates your database with high-quality example data on first run.
- **Role-Based Architecture**: Complete segregation of Admin and Member responsibilities.
- **Interactive Kanban**: Drag-and-drop task progression with animated confetti celebrations on completion.
- **Real-Time Analytics**: Built-in visual analytics charting project completion and status breakdowns.
- **Zero-Error Guarantee**: Highly robust REST API with meticulous error handling.

---

## 🛠️ Technology Stack
- **Frontend**: Vanilla JS, Advanced CSS Variables, Canvas API, Chart.js, Anime.js, Confetti.js, Three.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT Authentication, Bcrypt Password Hashing

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/AADITYA104/TASKFLOW.git
cd TASKFLOW
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory (optional if running locally with default MongoDB):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=super_secret_premium_key_2026
PORT=3000
```

### 3. Launch
Start the backend server and let the magic happen. The database will automatically seed itself.
```bash
npm run dev
```

### 4. Experience It
Navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and retrieve JWT

### Projects (Admin Exclusive)
- `GET /api/projects` - Retrieve all active projects
- `POST /api/projects` - Initialize a new project
- `PUT /api/projects/:id` - Modify project details
- `DELETE /api/projects/:id` - Archive a project

### Tasks
- `GET /api/tasks` - Retrieve tasks (Filters automatically by role)
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update status or assignment (Validation enforced)
- `DELETE /api/tasks/:id` - Permanently remove a task (Admin Exclusive)

---

<div align="center">
  <p><i>Crafted with precision for optimal productivity.</i></p>
</div>
