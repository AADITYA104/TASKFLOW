# TASKFLOW - Premium Team Task Manager 🚀

TaskFlow is a **Full-Stack (MERN)** project designed for modern teams, built with a premium dark aesthetic, high-end microinteractions, and secure role-based access control.

## 🌟 Key Features
- **Frontend**: Vanilla JS + CSS (Glassmorphism, 3D Hover Tilt, Ripple Effects, Confetti)
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB + Mongoose
- **Authentication**: Secure JWT (JSON Web Tokens) & `bcryptjs` password hashing
- **Role-Based Access**: 
  - **Admin**: Can create tasks, manage all projects, view team members, and access all analytics.
  - **Member**: Can only view and manage tasks assigned explicitly to them.

## 🛠️ Tech Stack
- HTML5, CSS3, JavaScript (Frontend)
- Anime.js (Smooth UI transitions & counters)
- Three.js & Canvas-Confetti (3D Particles & rewards)
- Node.js & Express.js (REST API Server)
- MongoDB Atlas (Cloud Database)

---

## 🚀 How to Run Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Create a `.env` file in the root directory and add your MongoDB Atlas Connection String:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
   JWT_SECRET=super_secret_key_123
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **View the App**
   Open your browser and navigate to: `http://localhost:3000`

---

## 🌍 How to Deploy (Render.com - Free)
To get your **Live URL** for the assignment submission, follow these exact steps:

1. Create a free account on [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select this `TASKFLOW` repository.
4. Render will auto-detect Node.js. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Scroll down to **Environment Variables** and add two keys:
   - `MONGODB_URI` ➔ (Paste your MongoDB Atlas URL here)
   - `JWT_SECRET` ➔ (Type any random secret text like `my_secure_jwt_key`)
6. Click **Create Web Service**. 
7. Wait 2-3 minutes. Render will give you a live URL (e.g., `https://taskflow-xyz.onrender.com`). **Copy this URL for your assignment submission!**

---

## 🔒 Default Accounts (Once DB is connected)
You can register new accounts, but here is a typical setup:
- **Admin**: Create an account with Role: `Admin` (Full Access)
- **Member**: Create an account with Role: `Member` (Limited Access)

*Designed & Built for Premium Productivity.*
