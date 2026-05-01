<div align="center">
  <h1>🚀 TaskFlow</h1>
  <p><strong>A Premium Team Task Management Application</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.io" />
  </p>
</div>

<br />

TaskFlow is a highly polished, full-stack project and task management solution tailored for modern teams. Built with a focus on seamless user experience, it features real-time synchronization, role-based access controls, interactive Kanban boards, and a beautifully crafted dark-themed interface.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based Signup and Login with encrypted passwords.
- **👥 Role-Based Access Control (RBAC)**: Strict separation of privileges between **Admin** and **Member** roles.
- **📊 Interactive Dashboard**: Real-time insights, overdue task tracking, and dynamic visual charts using Chart.js.
- **📋 Kanban Board**: Effortlessly manage task statuses with intuitive Drag and Drop.
- **🏢 Project Workspaces**: Create, manage, and track individual projects with custom color coding.
- **⚡ Real-Time Collaboration**: Powered by Socket.io, the UI automatically updates for all users when tasks or projects are modified.
- **🔍 Global Command Palette**: Hit `CMD+K` / `CTRL+K` for instant search and quick actions.
- **📝 Audit Trail**: Comprehensive activity logging for total transparency.
- **🎨 Premium UI/UX**: Cinematic animations, glassmorphism elements, and responsive design.

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (CSS Variables, Flexbox/Grid)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: Socket.io
- **Libraries**: Chart.js (Analytics), Canvas Confetti (Micro-interactions)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Cluster (or local instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/TaskFlow.git
   cd TaskFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   PORT=3000
   ```

4. **Seed the Database (Optional)**
   To populate the application with mock data for testing, run:
   ```bash
   node seed.js
   ```

5. **Run the Application**
   ```bash
   npm run dev
   ```

6. **Access the App**
   Open your browser and navigate to `http://localhost:3000`.

## 🧪 Demo Accounts

If you run the `seed.js` script, the following demo accounts are created automatically:

- **Admin Account**: `admin@taskflow.io` / `admin123`
- **Member Account**: `member@taskflow.io` / `member123`

---

<div align="center">
  <p>Built with ❤️ for modern agile teams.</p>
</div>
