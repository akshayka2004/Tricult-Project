# 🎮 Tricult — Token Gaming System

A premium cyberpunk-themed **Token Transaction & Gaming Hub Management System** built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**. Features role-based dashboards for Users, Admins, and Volunteers with QR scanning, token recharge, and real-time session monitoring.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Set Up Supabase](#step-3-set-up-supabase)
  - [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
  - [Step 5: Set Up the Database](#step-5-set-up-the-database)
  - [Step 6: Seed Admin & Volunteer Accounts](#step-6-seed-admin--volunteer-accounts)
  - [Step 7: Run the Application](#step-7-run-the-application)
- [Default Login Credentials](#-default-login-credentials)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Scripts Reference](#-scripts-reference)

---

## ✨ Features

| Role           | Features                                                                                   |
|----------------|--------------------------------------------------------------------------------------------|
| **Admin**      | Create users, recharge tokens, view all transactions, change passwords                     |
| **User**       | View balance, view transaction history, change password                                    |
| **Volunteer**  | QR code scanning, hub session monitoring, real-time timer tracking                         |

- 🎨 Premium cyberpunk UI with golden/dark theme & Orbitron typography
- 📱 QR code scanning for quick user lookup
- 🔐 Secure password hashing with bcryptjs
- 🎫 Auto-generated ticket numbers for new users
- ⚡ Real-time token recharge with animated confirmation modals
- 📊 Complete transaction history tracking

---

## 🛠 Tech Stack

| Category       | Technology                                      |
|----------------|--------------------------------------------------|
| **Frontend**   | React 19, Vite 7, Tailwind CSS 4                |
| **Backend**    | Supabase (PostgreSQL + REST API)                 |
| **Auth**       | Custom authentication with bcryptjs              |
| **Icons**      | Lucide React                                     |
| **QR Code**    | html5-qrcode                                     |
| **Routing**    | React Router DOM v7                              |

---

## 📦 Prerequisites

Make sure you have the following installed on your system:

| Software       | Version  | Download Link                                      |
|----------------|----------|-----------------------------------------------------|
| **Node.js**    | v18+     | [https://nodejs.org](https://nodejs.org)             |
| **npm**        | v9+      | Comes with Node.js                                   |
| **Git**        | Latest   | [https://git-scm.com](https://git-scm.com)           |

You will also need a **Supabase** account (free tier works):
- [https://supabase.com](https://supabase.com)

### Verify installations:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show git version 2.x.x
```

---

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/akshayka2004/Tricult-Project.git
cd Tricult-Project
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `react`, `react-dom`, `react-router-dom` — Frontend framework & routing
- `@supabase/supabase-js` — Database & API client
- `bcryptjs` — Password hashing
- `html5-qrcode` — QR code scanner
- `lucide-react` — Icons
- `tailwindcss`, `vite` — Build tools

### Step 3: Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and **create a free account**
2. Click **"New Project"** and fill in:
   - **Project Name**: `tricult` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it somewhere)
   - **Region**: Select the closest region to your location
3. Wait for the project to be provisioned (~2 minutes)
4. Once ready, go to **Settings → API** and note down:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT string starting with `eyJ...`)

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Windows (CMD)
echo VITE_SUPABASE_URL=your_supabase_project_url > .env
echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key >> .env

# OR manually create the file
```

Or create the file manually with a text editor:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_full_key_here
```

> ⚠️ **Important**: Replace the placeholder values with your actual Supabase credentials from Step 3.

### Step 5: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire contents of the [`supabase-schema.sql`](supabase-schema.sql) file
4. Click **"Run"** to execute the SQL

This creates 3 tables:

| Table            | Purpose                                          |
|------------------|--------------------------------------------------|
| `profiles`       | User accounts (admin, volunteer, regular users)  |
| `transactions`   | Token recharge/deduction history                 |
| `sessions`       | Active gaming hub sessions                       |

It also enables Row Level Security (RLS) and seeds default admin/volunteer accounts.

### Step 6: Seed Admin & Volunteer Accounts

If the SQL seed in Step 5 was executed correctly, the default accounts are already created. However, if you need to **reset passwords** or **re-create** the accounts, run:

```bash
# Reset/create admin account
node setup-admin.js

# Reset/create volunteer account
node setup-volunteer.js
```

### Step 7: Run the Application

```bash
# Development mode (with hot reload)
npm run dev
```

The application will start at: **http://localhost:5173**

---

## 🔑 Default Login Credentials

| Role           | Ticket Number | Password        | Login Page             |
|----------------|---------------|-----------------|------------------------|
| **Admin**      | `ADMIN-001`   | `admin123`      | `/admin`               |
| **Volunteer**  | `VOL-001`     | `volunteer123`  | `/volunteer`           |
| **User**       | *(created by admin)* | *(set by admin)* | `/` (home page)   |

> 💡 **Tip**: Regular user accounts are created by the Admin from the Admin Dashboard. The admin sets the username, password, and initial token balance.

---

## 📁 Project Structure

```
Tricult-Project/
├── public/
│   └── assets/
│       ├── backgrounds/          # Background decoration images
│       │   ├── bg1.png
│       │   ├── bg3.png
│       │   └── bg4.png
│       └── game-hub-logo.png     # Main application logo
│
├── src/
│   ├── components/
│   │   ├── BackgroundDecorations.jsx   # Corner background images
│   │   ├── BillModal.jsx               # Transaction receipt modal
│   │   ├── ChangePasswordModal.jsx     # Password change modal
│   │   ├── ProtectedRoute.jsx          # Auth route guard
│   │   ├── QRScanner.jsx               # QR code scanner
│   │   ├── RechargeConfirmModal.jsx    # Token recharge modal
│   │   └── TransactionList.jsx         # Transaction history list
│   │
│   ├── context/
│   │   └── AuthContext.jsx             # Authentication state management
│   │
│   ├── lib/
│   │   ├── constants.js                # App-wide constants
│   │   ├── supabase.js                 # Supabase client initialization
│   │   └── ticketGenerator.js          # Auto ticket number generator
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx          # Admin control panel
│   │   ├── AdminLogin.jsx              # Admin login page
│   │   ├── UserDashboard.jsx           # User token dashboard
│   │   ├── UserLogin.jsx               # User login page
│   │   ├── VolunteerDashboard.jsx      # Hub monitoring dashboard
│   │   └── VolunteerLogin.jsx          # Volunteer login page
│   │
│   ├── App.jsx                  # Main app with routing
│   ├── index.css                # Global styles & design system
│   └── main.jsx                 # Application entry point
│
├── hub-qr-codes/                # Pre-generated hub QR codes
├── .env                         # Environment variables (NOT in git)
├── generate-qr-codes.js         # QR code generation script
├── setup-admin.js               # Admin account setup script
├── setup-volunteer.js           # Volunteer account setup script
├── supabase-schema.sql          # Complete database schema
├── package.json                 # Dependencies & scripts
└── vite.config.js               # Vite configuration
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub (already done ✅)
2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** → Import `Tricult-Project`
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **"Deploy"**

### Deploy to Netlify

1. Go to [https://netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select `Tricult-Project`
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables in **Site settings → Environment variables**
6. Click **"Deploy site"**

### Build for Production (Manual)

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

---

## 📜 Scripts Reference

| Command                    | Description                              |
|----------------------------|------------------------------------------|
| `npm run dev`              | Start development server (port 5173)     |
| `npm run build`            | Build for production                     |
| `npm run preview`          | Preview production build locally         |
| `npm run lint`             | Run ESLint for code quality              |
| `node setup-admin.js`      | Create/reset admin account               |
| `node setup-volunteer.js`  | Create/reset volunteer account           |
| `node generate-qr-codes.js`| Generate hub QR code images             |

---

## 📄 License

This project is for educational and event management purposes.

---

**Built with ❤️ by Akshay K A**
