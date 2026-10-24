# StaffSync — Enterprise Human Resource Management (HRM) System

An enterprise-grade, role-based Human Resource Management System following the **Model-View-Controller (MVC)** architectural pattern. Built with **React.js**, **Node.js + Express.js**, **MongoDB + Mongoose**, and **JWT-based Role-Based Access Control (RBAC)**.

---

## 🌟 Key Features by Role

### 👩‍💼 HR Personnel (HR Dashboard)
- **Employee Management (CRUD)**: Create, view, update, and delete employee records; automatic credential provisioning.
- **Leave Management**: Review, approve, or reject employee leave requests with custom remarks.
- **Attendance Monitoring**: Company-wide daily attendance logs, punctuality metrics, and date-filtered historical reports.
- **Internal Communication**: Broadcast urgent and pinned company announcements across all departments.
- **Workforce Analytics**: Department headcount distribution, leave trends, and attendance rates.

### 👨‍💼 Team Manager (Manager Dashboard)
- **Team Supervision**: Direct report tracking, team daily attendance, and squad roster.
- **Leave Approvals**: Review and approve/reject leave applications submitted by managed team members.
- **Training & Development**: Create training programs, assign team members, and monitor module completion progress.
- **Department Announcements**: Post updates for teams and squads.

### 👨‍💻 Staff Employee (Employee Hub)
- **Digital Attendance Clock**: Real-time digital clock, location tagging (Office, Remote, Hybrid), and Check In / Check Out with automatic work hours computation.
- **Leave Management**: Apply for leaves with automatic duration calculation, view remaining annual leave balances, and inspect reviewer comments.
- **Training Hub**: View assigned courses, track module progress, and log completion increments.
- **Personal Records**: Update phone number, residential address, emergency contact details, and skill sets.
- **Announcements Feed**: Read prioritized company news and leadership notices.

---

## 🚀 Quick Start

### 1. Install & Run Dev Server
```bash
# In project root:
npm install
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### 2. Database Seeding
To reset or re-populate the MongoDB database with realistic employees, leaves, attendance, training courses, and announcements:
```bash
npm run seed
```

---

## ⚡ Deploying to Vercel (Live in 3 Minutes)

StaffSync is configured for zero-configuration, 1-click deployment on **Vercel** with a unified monorepo structure (React Vite frontend + Express Serverless API on the same domain).

### Prerequisites
1. A free **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** cluster.
   - In MongoDB Atlas, go to **Network Access** > **Add IP Address** > choose **Allow Access from Anywhere (`0.0.0.0/0`)** (required for Vercel serverless functions).
   - Go to **Database Access** > create a database user and password.
   - Click **Connect** > **Drivers** > copy your connection string (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/staffsync?retryWrites=true&w=majority`).
2. A free **[Vercel](https://vercel.com)** account.

### Step-by-Step Vercel Deployment

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and serverless API"
   git push origin main
   ```

2. **Import Project into Vercel**:
   - Log in to your Vercel Dashboard and click **"Add New..."** > **"Project"**.
   - Select your `staffsync` repository and click **Import**.
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: `./` (leave default).

3. **Configure Environment Variables in Vercel**:
   Under **Environment Variables**, add:
   | Variable | Value | Required | Description |
   | :--- | :--- | :--- | :--- |
   | `MONGODB_URI` | `mongodb+srv://...` | **Yes** | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | *random string* | **Yes** | 32+ character random secret for JWT signing |
   | `NODE_ENV` | `production` | Optional | Set to `production` |

4. **Click "Deploy"**:
   - Vercel installs dependencies, builds the Vite React client, and packages the Express API as a serverless function.
   - Once deployment completes, your site will be live at `https://your-staffsync-app.vercel.app`!

5. **Populate Demo Data**:
   - **Method A (Automatic)**: Simply click any **"Quick Switch"** demo role (HR Director, Engineering Manager, etc.) on the login page; the system automatically detects an empty database and seeds it on the fly!
   - **Method B (Browser/API)**: Visit `https://your-staffsync-app.vercel.app/api/seed` in your browser or make a `POST /api/seed` request.
   - **Method C (Health Check)**: Check status at `https://your-staffsync-app.vercel.app/api/health`.

---

## 🔑 Demo Login Credentials

The system provides **1-Click Quick Role Switchers** directly in the top navigation bar and on the login page:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **HR Director** | Sarah Jenkins | `hr@staffsync.com` | `password123` |
| **Engineering Manager** | David Miller | `manager@staffsync.com` | `password123` |
| **Staff Employee** | Alex Rivera | `alex.rivera@staffsync.com` | `password123` |
| **Product Designer** | Priya Patel | `priya.patel@staffsync.com` | `password123` |
| **DevOps Engineer** | Marcus Chen | `marcus.chen@staffsync.com` | `password123` |

---

## 📐 MVC Architecture Breakdown

- **Model Layer** (`server/models/`):
  - `User.js` — Authentication credentials, bcrypt password hashing, roles.
  - `Employee.js` — Complete employment profile, manager relationships, contact coordinates.
  - `LeaveRequest.js` — Leave duration, dates, status (`Pending`, `Approved`, `Rejected`), reviewer comments.
  - `Attendance.js` — Daily punches, check-in/out timestamps, location, hours worked.
  - `Announcement.js` — Organization updates, priority badges, category, pinned status.
  - `TrainingProgram.js` — Skill programs, syllabus, instructor, enrolled employee progress.
- **Controller Layer** (`server/controllers/`):
  - `authController.js`, `employeeController.js`, `leaveController.js`, `attendanceController.js`, `announcementController.js`, `trainingController.js`, `reportController.js`.
- **View / Routing Layer** (`server/routes/`):
  - REST API routing endpoints protected with JWT and role-based middleware (`verifyToken`, `authorizeRoles`).
