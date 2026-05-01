# TaskFlow - Premium Task Management Platform

TaskFlow is a high-end, full-stack project management application designed with a premium "Midnight Bloom" aesthetic. It features dynamic 3D animations, real-time status tracking, role-based access control, and a glassmorphism UI.

![TaskFlow Screenshot](./assets/splash-icon.png)

## 🌟 Key Features
- **Role-Based Access Control**: Admins can manage projects and team members; Members can only view and interact with their assigned tasks.
- **Interactive Kanban Board**: Drag-and-drop task management with 3D tilt hover effects and celebration confetti upon completion.
- **3D & Micro-Animations**: Three.js floating particle background on auth screens, GSAP-style page flip transitions, and count-up animations on statistical dashboards.
- **Glassmorphism UI**: High-end aesthetic using CSS backdrop filters, custom scrolling, and dynamic lighting effects.
- **Data Persistence**: Backed by a Node.js/Express server and MongoDB for robust structured data storage and RESTful API communication.

## 🛠 Tech Stack
- **Frontend**: HTML5, CSS3 (Variables, Grid/Flexbox, Backdrop-filters), Vanilla JavaScript
- **Animations**: Anime.js, Three.js, Canvas-Confetti
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: JWT (JSON Web Tokens), bcryptjs

## 🚀 How to Run Locally
1. Clone the repository: `git clone https://github.com/AADITYA104/TASKFLOW.git`
2. Navigate into the directory: `cd TASKFLOW`
3. Install dependencies: `npm install`
4. Set up your `.env` file with `MONGODB_URI` and `JWT_SECRET`
5. Start the server: `npm start`
6. Open `http://localhost:3000` in your browser.

*(Note: Expo Go mobile version is available in the `/mobile` directory. CD into it and run `npm start`)*

## 🌐 Live URL
- **Web App**: [Add your Railway URL here]
- **Mobile App**: Run via Expo Go

## 🧪 Demo Credentials
- **Admin**: `admin@taskflow.io` / `admin123`
- **Member**: `member@taskflow.io` / `member123`
(Note: You can register a new account on the login screen).
