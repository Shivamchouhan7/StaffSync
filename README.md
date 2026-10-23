# StaffSync

StaffSync is a role-based Human Resource Management System built with React, Express, MongoDB, and JWT authentication. It provides separate portals for HR users, managers, and employees.

## Features

### Authentication and access control

- JWT-based login and protected API routes
- Roles: `hr`, `manager`, and `employee`
- Password hashing with `bcryptjs`
- Role-protected frontend portals
- Current-user and password-update endpoints

> The current public registration form allows users to select a role. For production, HR and manager account creation should be restricted to a protected administrative workflow.

### HR portal

- View and manage employees
- Create employee accounts
- Activate or deactivate employee accounts
- Assign existing employees to managers
- Review and approve or reject leave applications
- View attendance records
- Create, edit, pin, and delete announcements
- Target announcements to all users, employees, managers, or HR
- Create and manage training programs

### Manager portal

- View leave applications from assigned team members
- Approve or reject team leave requests
- Create and update training programs
- Manage training enrollment status
- View team attendance through the backend API

### Employee portal

- View profile information
- View role-targeted announcements
- Apply for leave and view leave history
- Check in and check out
- View attendance history
- View available trainings and enrollment information

### Notifications

The backend creates in-app notifications for supported events such as announcements, leave actions, attendance events, and training activity. Authenticated users can retrieve notifications and mark them as read through the notification API.

## Technology stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Redux Toolkit store included in `client/src/app/store.js`
- Lucide React icons
- Custom CSS in `client/src/App.css` and `client/src/index.css`

The current portal pages use local storage for the active token and user session. The Redux store is available but is not currently used as the primary session source.

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- Helmet
- CORS
- express-validator
- Morgan development logging

## Project structure

```text
StaffSync/
├── client/
│   ├── src/
│   │   ├── app/store.js
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── employee/
│   │   │   ├── hr/
│   │   │   ├── manager/
│   │   │   ├── ui/
│   │   │   └── Home.jsx
│   │   ├── lib/utils.js
│   │   ├── pages/
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── HrDashboard.jsx
│   │   │   └── ManagerDashboard.jsx
│   │   ├── routes/ProtectedRoute.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── server/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/seed.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB local instance or MongoDB Atlas database

## Configuration

### Backend

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Use a strong, private value for `JWT_SECRET`. Never commit `.env` files or database credentials.

### Frontend

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation and development

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Start the backend:

```bash
cd server
npm run dev
```

The API listens on `http://localhost:5000` by default.

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

The frontend is available at `http://localhost:5173`.

## Database seeding

The seed script clears the configured database and creates sample users, employees, managers, attendance records, leave records, announcements, trainings, and notifications.

```bash
cd server
npm run seed
```

Do not run this against a production database because it deletes existing records.

## Frontend routes

| Route | Access |
| --- | --- |
| `/` | Public landing page |
| `/login` | Public login |
| `/register` | Public registration |
| `/employee-portal` | Employee users |
| `/manager-portal` | Manager users |
| `/hr-portal` | HR users |

## API overview

All API routes use the `/api` prefix. Protected endpoints require:

```text
Authorization: Bearer <jwt-token>
```

### Health

- `GET /api/health`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/setup-admin`
- `PUT /api/auth/update-password`

### Employees

- `GET /api/employees` - HR employee listing
- `POST /api/employees` - Create an employee or manager account
- `GET /api/employees/:id` - View an employee
- `PUT /api/employees/:id` - Update employee information
- `PATCH /api/employees/:id/status` - Activate or deactivate an account
- `PUT /api/employees/me/profile` - Update the current user's profile

### Managers

- `GET /api/managers` - HR manager listing
- `GET /api/managers/my-team` - Current manager's team
- `POST /api/managers/:id/assign` - Assign employees to a manager
- `POST /api/managers/:id/remove` - Remove a team member

### Attendance

- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance/me`
- `GET /api/attendance/team`
- `GET /api/attendance`

### Leave

- `POST /api/leaves`
- `GET /api/leaves/me`
- `GET /api/leaves/team`
- `GET /api/leaves`
- `PATCH /api/leaves/:id/status`
- `DELETE /api/leaves/:id`

### Announcements

- `GET /api/announcements`
- `POST /api/announcements`
- `PUT /api/announcements/:id`
- `DELETE /api/announcements/:id`

Announcements support `low`, `medium`, `high`, and `urgent` priorities; target roles `all`, `employee`, `manager`, and `hr`; and pinned ordering.

### Training

- `GET /api/trainings`
- `GET /api/trainings/:id`
- `POST /api/trainings`
- `PUT /api/trainings/:id`
- `POST /api/trainings/:id/enroll`
- `PATCH /api/trainings/:id/enrollment/:userId`

### Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

## Validation commands

Build the frontend:

```bash
cd client
npm run build
```

Run the frontend linter:

```bash
cd client
npm run lint
```

Check the backend health endpoint after starting the server:

```text
http://localhost:5000/api/health
```

## Security notes

- Use a strong `JWT_SECRET`.
- Restrict MongoDB network access in production.
- Do not commit `.env` files.
- Restrict HR and manager registration before production deployment.
- Use HTTPS in production.
- Do not run the seed script against production data.

## License

This project is developed as an academic HR management application.
