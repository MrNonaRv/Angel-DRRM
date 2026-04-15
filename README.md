# Mambusao DRRM Inventory Management System

A full-stack inventory management system for Disaster Risk Reduction and Management (DRRM), featuring equipment tracking, medical supply monitoring, and borrower logs.

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js** (v18 or higher) - Download from [nodejs.org](https://nodejs.org/)

### 🛠️ Automatic Setup & Run

#### For Windows Users:
1.  Double-click **`setup.bat`** to install all necessary components.
2.  Double-click **`run.bat`** to start the application.
3.  Open your browser to `http://localhost:3000`.

#### For Linux / macOS Users:
1.  Open your terminal in this folder.
2.  Run `./setup.sh` to install components.
3.  Run `./run.sh` to start the application.
4.  Open your browser to `http://localhost:3000`.

---

## 🔑 Default Credentials
- **Username:** `admin`
- **Password:** `mambusao2026`

## 📂 Project Structure
- `server.ts`: Express backend with SQLite database.
- `src/App.tsx`: Main React frontend.
- `mambusao_drrm.db`: Local database file (created automatically).

## 💡 Troubleshooting
- **Blank Screen?** Make sure you are running the app via `npm run dev` or the provided `run` scripts. The backend must be active for the frontend to work.
- **Port 3000 busy?** Ensure no other applications are using port 3000, or modify the `PORT` constant in `server.ts`.
