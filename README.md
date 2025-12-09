# IDTTS - Task Tracking System (نظام تتبع المهام)

IDTTS is a robust, full-stack task management application designed to streamline departmental workflows and provide high-level visibility for executives. Built with transparency and efficiency in mind, it features a fully localized Arabic user interface (RTL) to support regional teams.

## 🚀 Key Features

*   **Kanban Task Management**: Visualize and manage tasks across different stages using an interactive Kanban board.
*   **Department & User Management**: Administrative tools to manage organizational structure, departments, and user accounts.
*   **Role-Based Access Control**: Secure access with distinct roles (e.g., Admin) ensuring data privacy and operational integrity.
*   **Reporting Dashboard**: A comprehensive interactive dashboard for executives. Features drill-down capabilities (Priority &rarr; Department &rarr; Status) and visual analytics powered by Chart.js to monitor KPIs and project health.
*   **Reporting Dashboard**:
    -   **Progress Charts**: Interactive drill-down charts (Priority -> Department -> Status).
    -   **Time Deviation Report**: Analysis of Planned vs Actual time performance by department, highlighting delayed tasks.
    -   **Reports**: Tables for filtering and exporting task data.
*   **Task Assignment & Workflow**: Assign tasks to specific users, track ownership, and utilize a "Submit for Review" workflow to ensure quality control.
*   **Arabic Localization**: Designed from the ground up with Arabic language support and Right-to-Left (RTL) layout.

## 🛠️ Technology Stack

### Frontend
*   **Angular**: Component-based framework for a dynamic and responsive UI.
*   **Bootstrap 5**: Modern styling and responsive design.
*   **Bootstrap Icons**: Comprehensive icon library.
*   **Chart.js & ng2-charts**: Powerful and flexible charting for the reporting dashboard.

### Backend
*   **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
*   **Mongoose**: Elegant MongoDB object modeling for Node.js.
*   **MongoDB**: NoSQL database for flexible data storage.

### DevOps
*   **Docker**: Containerization for consistent environments (includes `docker-compose` for MongoDB).
*   **Shell Scripts**: Automated deployment scripts (`deploy-direct.sh`, `deploy-to-vm.sh`) for streamlining releases.

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   Docker & Docker Compose (for the database) or a local MongoDB instance.

### Installation & Build

 The project includes a root script to handle dependencies and building for both the frontend and backend:

```bash
# Install dependencies and build both frontend and backend
npm run build
```

This script will:
1.  Navigate to `frontend/`, install dependencies, and build the Angular app.
2.  Navigate to `backend/`, install dependencies, and build the NestJS app.

### Running the Application

1.  **Start Database**:
    Ensure MongoDB is running. You can use the provided Docker Compose file:
    ```bash
    docker-compose up -d mongo
    ```

2.  **Start Backend**:
    ```bash
    npm start
    ```
    This command starts the backend server in production mode (which serves the built frontend from `client/` if configured).

    *Note: For development, you may want to run the frontend and backend separately using `ng serve` and `nest start:dev` respectively in their directories.*
