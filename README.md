<div align="center">
  <div style="background: linear-gradient(180deg, #111 0%, #000 100%); padding: 40px; border-radius: 16px; margin-bottom: 20px;">
    <h1 style="color: #fff; font-size: 3rem; margin: 0;">TaskFlow</h1>
    <p style="color: #a1a1aa; font-size: 1.2rem; margin-top: 10px;">The Ultimate Team Task Management Platform</p>
  </div>

  [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
  [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-success)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express-5.2.1-lightgrey)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)](https://www.mongodb.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)](https://socket.io/)
</div>

---

TaskFlow is a premium, full-stack SaaS task management application designed for modern teams. Built with a hyper-focus on a seamless UI/UX and robust functionality, it provides an intuitive interface for project tracking, role-based access control, and real-time collaboration.

![TaskFlow Dashboard Preview](https://via.placeholder.com/1200x600.png?text=TaskFlow+Dashboard+Preview)

## ✨ World-Class Features

- 🔐 **Secure Authentication**: JWT-based sign up, login, and robust password management.
- 👥 **Role-Based Access Control (RBAC)**: Distinct permissions for **Admin** (project/team management) and **Member** roles.
- 📊 **Interactive Dashboard**: Track overdue tasks, project status, and view dynamic charts (powered by Chart.js).
- 🖱️ **Kanban Board**: Seamless drag-and-drop task progression (To Do → In Progress → Done) with completion animations.
- 📁 **Project Management**: Create, edit, and track projects with dedicated colors and deadlines.
- ⚡ **Real-Time Collaboration**: Instant UI updates across all connected clients via Socket.io.
- ⌨️ **Command Palette (⌘K)**: Global search and quick-action shortcuts for ultimate productivity.
- 📜 **Audit Trail & Activity Log**: Comprehensive tracking of all task and project mutations.
- 🔔 **Smart Notifications**: Interactive dropdown for real-time alerts.
- 🎨 **Premium UI/UX**: Vercel/Linear-inspired aesthetic with dark/light modes, glassmorphism, and fluid micro-animations.

## 🛠️ Technology Stack

| Frontend | Backend | Database & Tools |
|----------|---------|------------------|
| HTML5 / CSS3 | Node.js | MongoDB |
| Vanilla JavaScript | Express.js | Mongoose ODM |
| Chart.js | Socket.io | JWT (Auth) |
| Canvas API (3D BGs) | Nodemailer | bcryptjs |

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/AADITYA104/TASKFLOW.git
cd TASKFLOW
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=3000
```

### 4. Seed the Database (Optional but Recommended)
Populate the database with initial projects, tasks, and demo users:
```bash
node seed.js
```

**Demo Accounts Created:**
- **Admin**: `admin@taskflow.io` / `admin123`
- **Member**: `member@taskflow.io` / `member123`

### 5. Run the Application
Start the development server with live-reload:
```bash
npm run dev
```
Start for production:
```bash
npm start
```
The application will be accessible at `http://localhost:3000`.

## 🌐 Deployment

TaskFlow is optimized for easy deployment on modern cloud platforms like Render, Heroku, or Vercel.

1. Connect your GitHub repository to your hosting provider.
2. Ensure the build command is `npm install` and the start command is `node server.js`.
3. Set the `MONGODB_URI` and `JWT_SECRET` in your host's environment variables dashboard.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/AADITYA104/TASKFLOW/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the ISC License. See `package.json` for more information.

---
<div align="center">
  <i>Built with passion by <a href="https://github.com/AADITYA104">Aaditya</a></i>
</div>
