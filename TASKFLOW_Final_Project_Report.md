# TaskFlow - Project Report

## Overview
TaskFlow is a custom-built, full-stack task management system. The goal of this project was to create a functional team collaboration tool with a Kanban board, utilizing a standard Node.js and MongoDB stack.

## Key Features
- **User Authentication**: JWT-based login and registration.
- **Role-Based Access Control**: Basic separation between Admin and Member roles to restrict project and user management.
- **Task Management**: Drag-and-drop Kanban board (To Do, In Progress, Done).
- **Dashboard**: Simple analytics and an overview of overdue tasks.
- **Real-Time Updates**: UI state synchronization across different clients using Socket.io.
- **Command Palette**: A quick search interface triggered via keyboard shortcuts.

## Technical Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla, no framework)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Deployment**: Configured for Render

## Recent Improvements
- Refactored UI to include smoother transitions and better feedback on drag-and-drop actions.
- Secured task and project update routes to prevent unauthorized state changes.
- Added a notification dropdown and fixed logout button visibility issues.
- Updated database seeding scripts for easier local setup.

## Conclusion
The application successfully demonstrates the integration of a REST API with a dynamic, vanilla JavaScript frontend, providing a solid foundation for basic project management workflows.
