# StaffSync — Enterprise Human Resource Management System (HRMS)

StaffSync is an enterprise-grade, individual capstone MERN-stack Human Resource Management System engineered with strict role-based access control (RBAC), server-authoritative attendance logging, multi-tier leave approval policies, and real-time operational analytics.

---

## 🚀 Key Highlights & Architecture

- **Strict Server-Side Authorization (RBAC)**: Enforces role permissions for **HR**, **Manager**, and **Employee** on all endpoints. Public registration is contained strictly to the `employee` role to prevent unauthorized privilege escalation.
- **Fail-Safe Database Connectivity**: Built with MongoDB Atlas and local MongoDB support. The server explicitly halts startup and logs diagnostics if `MONGODB_URI` is missing or unreachable.
- **Server-Generated Attendance & Workday Integrity**: Check-in and check-out timestamps are strictly server-generated. A compound unique index (`user` + `date`) prevents duplicate check-ins on the same workday.
- **Role-Scoped Leave Approval Policy**: HR administrators can review company-wide requests. Department Managers can approve or reject leave requests exclusively for members of their assigned direct reporting teams.
- **Explicit Performance Appraisals**: Structured evaluation records with ratings, goal metrics, and qualitative feedback without synthetic or invented scores.
- **Polished SaaS UI/UX**: Designed with a clean SaaS aesthetic, responsive sidebar/topbar layouts, dark-mode sidebar, interactive punch consoles, real-time status pills, and zero console errors.

---

## 🛠 Technology Stack

### Frontend (`client/`)
- **Core**: React 19, Vite
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`), React Redux
- **Routing**: React Router v7 (`react-router-dom`)
- **HTTP Client**: Axios with centralized request/response JWT interceptors and auto session-expiration handling
- **UI Framework & Icons**: Bootstrap 5, Lucide React (`lucide-react`)
- **Typography & Styling**: Google Fonts (*Plus Jakarta Sans*, *Inter*), Custom SaaS design system in `index.css`

### Backend (`server/`)
- **Runtime & Framework**: Node.js (CommonJS), Express.js
- **Database**: MongoDB via Mongoose ODM v9
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, `helmet` security headers, `cors`, `express-validator` payload sanitization
- **Development**: `nodemon`, `morgan` logger

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Feature / Module | HR Administrator | Department Manager | Staff Employee |
| :--- | :---: | :---: | :---: |
| **Public Registration** | ❌ (Restricted to Employee) | ❌ (Restricted to Employee) | ✅ (`employee` role only) |
| **Initial Admin Bootstrap** | ✅ (One-time secure setup) | ❌ | ❌ |
| **Employee Directory** | Full CRUD, Deactivate, View Salary | View Assigned Team Only | View Own Profile Only |
| **Manager & Team Allocation** | Full Assignment / Reassignment | View Own Team Members | ❌ |
| **Attendance Punch Console** | View / Filter Company Logs | View Team Logs & Punctuality | Punch In/Out, View History |
| **Leave Approval Workflow** | Approve / Reject Any Leave | Approve / Reject Assigned Team Only | Apply & Track Status |
| **Announcements** | Create, Edit, Pin, Delete | View Role-Targeted & All | View Role-Targeted & All |
| **Training Programs** | Create, View Roster, Update Scores | Create & Manage for Team | Enroll in Courses |
| **Performance Reviews** | Company-Wide Appraisals | Conduct Team Appraisals | View Received Reviews |
| **In-App Notifications** | Real-time System Alerts | Team Alerts & Decision Notices | Application Status Notices |

---

## 📂 Project Directory Structure

```text
StaffSync/
├── .gitignore
├── README.md
├── client/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js               # Redux Toolkit store configuration
│   │   ├── components/
│   │   │   ├── EmptyState.jsx         # Zero-data feedback placeholder
│   │   │   ├── LoadingSpinner.jsx     # Consistent loading indicator
│   │   │   ├── Navbar.jsx             # Topbar with notifications & profile dropdown
│   │   │   ├── ProtectedRoute.jsx     # Role-guarded route wrapper
│   │   │   ├── Sidebar.jsx            # Dynamic role-scoped navigation sidebar
│   │   │   └── StatCard.jsx           # Metric KPI card
│   │   ├── features/
│   │   │   └── auth/
│   │   │       └── authSlice.js       # Redux authentication slice
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx    # Responsive shell layout
│   │   ├── pages/
│   │   │   ├── AnnouncementsPage.jsx  # Broadcast bulletins & noticeboard
│   │   │   ├── AttendancePage.jsx     # Punctuality tracking & daily punches
│   │   │   ├── DashboardPage.jsx      # Persona router (HR/Manager/Employee)
│   │   │   ├── EmployeeDashboard.jsx  # Employee punch box & workspace overview
│   │   │   ├── EmployeesPage.jsx      # Directory, filtering & modal CRUD
│   │   │   ├── HRDashboard.jsx        # Workforce KPIs & attendance pulse
│   │   │   ├── LeavesPage.jsx         # Leave applications & approval drawer
│   │   │   ├── LoginPage.jsx          # Sign-in with 1-click demo personas
│   │   │   ├── ManagerDashboard.jsx   # Team operations & pending requests
│   │   │   ├── ManagersPage.jsx       # Team hierarchy & member allocation
│   │   │   ├── NotFoundPage.jsx       # 404 handler
│   │   │   ├── PerformancePage.jsx    # Explicit appraisal records
│   │   │   ├── ProfilePage.jsx        # Self-service details & password update
│   │   │   ├── RegisterPage.jsx       # Public signup (employee role only)
│   │   │   ├── SetupAdminPage.jsx     # Root administrator bootstrap
│   │   │   └── TrainingsPage.jsx      # Course catalog & enrollment tracker
│   │   ├── services/
│   │   │   └── api.js                 # Central Axios client with interceptors
│   │   ├── App.jsx                    # Route hierarchy & protection
│   │   ├── index.css                  # Custom SaaS design system
│   │   └── main.jsx                   # Application bootstrap
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── server/
    ├── config/
    │   └── db.js                      # MongoDB connection with failure diagnostics
    ├── controllers/
    │   ├── announcementController.js
    │   ├── attendanceController.js
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── employeeController.js
    │   ├── leaveController.js
    │   ├── managerController.js
    │   ├── notificationController.js
    │   ├── performanceController.js
    │   └── trainingController.js
    ├── middleware/
    │   ├── auth.js                    # JWT verification & role authorization
    │   ├── errorHandler.js            # Centralized API error handler
    │   └── validate.js                # express-validator result handler
    ├── models/
    │   ├── Announcement.js
    │   ├── Attendance.js
    │   ├── Employee.js
    │   ├── Leave.js
    │   ├── Manager.js
    │   ├── Notification.js
    │   ├── Performance.js
    │   ├── Training.js
    │   └── User.js
    ├── routes/
    │   ├── announcementRoutes.js
    │   ├── attendanceRoutes.js
    │   ├── authRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── employeeRoutes.js
    │   ├── leaveRoutes.js
    │   ├── managerRoutes.js
    │   ├── notificationRoutes.js
    │   ├── performanceRoutes.js
    │   └── trainingRoutes.js
    ├── utils/
    │   └── seed.js                    # Full database seed utility
    ├── .env.example
    ├── package.json
    ├── server.js                      # Express server entry point
    └── test-api.js                    # Verification test suite
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** running locally on port `27017` or a **MongoDB Atlas** cluster URI

### 1. Clone & Configure Environment

```bash
git clone https://github.com/Shivamchouhan7/StaffSync.git
cd StaffSync
```

#### Backend Setup (`server/`)
```bash
cd server
cp .env.example .env
```
Ensure `server/.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2026_dev_prod_auth
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend Setup (`client/`)
```bash
cd ../client
cp .env.example .env
```
Ensure `client/.env` contains:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 2. Populate Demo Data (One-Command Database Seed)

From the `server` directory, run:
```bash
npm run seed
```
This populates:
- HR Administrator (`hr@staffsync.com`)
- Engineering Manager (`manager@staffsync.com`) & Design Lead (`sarah.manager@staffsync.com`)
- Employees with reporting lines, department assignments, and salaries
- Attendance logs for today and historical shifts
- Pending and approved leave applications
- Bulletins, training catalog programs, and performance appraisals

---

### 3. Start Development Servers

In terminal 1 (Backend):
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
# Vite server starts at http://localhost:5173
```

---

## 🔑 Demo Credentials (Click-to-Login in UI)

| Role | Email | Password | Scope & Privileges |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `hr@staffsync.com` | `Password@123` | Organization-wide administration, directory CRUD, approvals, announcements |
| **Engineering Manager** | `manager@staffsync.com` | `Password@123` | Direct reports oversight, team check-ins, team leave decisions, trainings |
| **Design Lead (Manager)** | `sarah.manager@staffsync.com` | `Password@123` | Design team oversight, team leaves, and appraisals |
| **Senior Engineer (Employee)** | `employee@staffsync.com` | `Password@123` | Personal check-in/out, leave applications, enrollments, personal evaluations |
| **Cloud Specialist (Employee)** | `priya@staffsync.com` | `Password@123` | Workplace self-service, leave requests, course enrollments |

---

## 🧪 Verification & Automated Testing

A dedicated test suite `server/test-api.js` verifies backend endpoints, database connectivity, and authorization:

```bash
cd server
node test-api.js
```

### Verified Scenarios:
1. `GET /api/health` — Verifies 200 OK and live MongoDB connection state.
2. `POST /api/auth/login` (HR) — Authenticates HR and generates JWT with `hr` role.
3. `POST /api/auth/login` (Manager) — Authenticates Manager with `manager` role.
4. `POST /api/auth/login` (Employee) — Authenticates Employee with `employee` role.
5. `RBAC Guardrails` — Confirms an Employee token receives `403 Forbidden` when attempting to access `/api/dashboard/hr`.
6. `HR Access` — Confirms HR token receives full organization metrics and pending counts.
7. `Manager Access` — Confirms Manager token receives team rosters and direct reporting metrics.
8. `Public Registration Containment` — Tests attempting to register with `role: "hr"`. Confirms server forces `employee` role.
9. `Workday Attendance Duplicate Prevention` — Tests re-punching for the same workday. Confirms rejection with `400 Bad Request`.
10. `In-App Notifications` — Confirms retrieval of in-app notification records.

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Public registration (creates `employee` role only)
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve active authenticated user and linked profile
- `POST /api/auth/setup-admin` — Bootstrap root HR administrator (only available when 0 HR admins exist)
- `PUT /api/auth/update-password` — Change password for authenticated session

### Workforce & Directory (`/api/employees`)
- `GET /api/employees` — List employees with search, department filters & pagination (*HR only*)
- `GET /api/employees/:id` — View employee details (*HR, assigned Manager, or self*)
- `POST /api/employees` — Add employee with designation and reporting line (*HR only*)
- `PUT /api/employees/:id` — Update job information, department, or manager (*HR only*)
- `PATCH /api/employees/:id/status` — Deactivate / activate employee account (*HR only*)
- `PUT /api/employees/me/profile` — Self-service update for permitted fields (*Authenticated user*)

### Team Hierarchy (`/api/managers`)
- `GET /api/managers` — List all managers and allocated team members (*HR only*)
- `POST /api/managers/:id/assign` — Assign employee team members to a manager (*HR only*)
- `POST /api/managers/:id/remove` — Remove direct report from a manager (*HR only*)
- `GET /api/managers/my-team` — View direct reports (*Manager only*)

### Attendance (`/api/attendance`)
- `POST /api/attendance/check-in` — Check in with server timestamp (unique per user per workday)
- `POST /api/attendance/check-out` — Check out and calculate workday duration
- `GET /api/attendance/me` — Personal attendance history
- `GET /api/attendance/team` — Direct reports attendance records (*Manager only*)
- `GET /api/attendance` — Organization-wide attendance records (*HR only*)

### Leaves (`/api/leaves`)
- `POST /api/leaves` — Apply for leave with start/end date validation
- `GET /api/leaves/me` — Personal leave requests and decision records
- `GET /api/leaves/team` — Direct reports leave requests (*Manager only*)
- `GET /api/leaves` — Organization-wide leave requests (*HR only*)
- `PATCH /api/leaves/:id/status` — Approve or reject leave (*HR or assigned Manager*)
- `DELETE /api/leaves/:id` — Cancel pending application (*Applicant*)

### Announcements, Trainings & Performance
- `/api/announcements` — Role-scoped bulletins and notices
- `/api/trainings` — Catalog, capacity validation, and enrollment progress
- `/api/performance` — Explicit appraisal records and ratings
- `/api/dashboard` — Aggregated real-time metrics for HR, Manager, and Employee personas
- `/api/notifications` — In-app alerts and mark-as-read updates

---

## 🚀 Production Deployment Guide

### Backend (Render, Railway, or Google Cloud Run)
1. Set Environment Variables in host dashboard:
   - `PORT`: `5000` (or host assigned `$PORT`)
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/staffsync?retryWrites=true&w=majority`
   - `JWT_SECRET`: A secure 64-character random string
   - `CLIENT_URL`: URL of the deployed frontend
   - `NODE_ENV`: `production`
2. Build & Start command:
   ```bash
   npm install && npm start
   ```

### Frontend (Netlify or Vercel)
1. Set Build Command: `npm run build`
2. Set Publish Directory: `dist`
3. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
4. Add single-page application redirect rule in `public/_redirects`:
   ```text
   /* /index.html 200
   ```

---

## 📄 License
This project is developed as an academic individual capstone project for Human Resource Management. All rights reserved.
