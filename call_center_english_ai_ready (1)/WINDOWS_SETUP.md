# Windows Setup Guide - Install Node.js and pnpm

You're getting this error because `pnpm` is not installed on your Windows computer. Here's how to fix it:

---

## Step 1: Install Node.js (If Not Already Installed)

### Check if Node.js is Installed

Open PowerShell and run:
```powershell
node --version
npm --version
```

**If you see version numbers**, Node.js is already installed. Skip to Step 2.

**If you see "not recognized"**, follow the installation steps below.

### Download and Install Node.js

1. **Go to:** https://nodejs.org/
2. **Click the LTS (Long Term Support) version** - This is the recommended version
3. **Download the Windows Installer (.msi file)**
4. **Run the installer** and follow the prompts:
   - Click "Next" through all screens
   - Accept the license agreement
   - Keep default settings
   - Click "Install"
5. **Restart your computer** (important!)

### Verify Installation

After restart, open PowerShell and run:
```powershell
node --version
npm --version
```

You should see version numbers like:
```
v22.x.x
10.x.x
```

---

## Step 2: Install pnpm

### Option A: Using npm (Easiest)

Open PowerShell and run:
```powershell
npm install -g pnpm
```

**You should see:**
```
added X packages
```

### Option B: Using Chocolatey (If you have it)

```powershell
choco install pnpm
```

### Option C: Using Scoop (If you have it)

```powershell
scoop install pnpm
```

---

## Step 3: Verify pnpm Installation

Open a **new PowerShell window** and run:
```powershell
pnpm --version
```

You should see a version number like:
```
9.x.x
```

**If you still see "not recognized":**
1. Close all PowerShell windows
2. Restart your computer
3. Open PowerShell again
4. Try `pnpm --version` again

---

## Step 4: Navigate to Your Project

In PowerShell, navigate to your project folder:

```powershell
cd "C:\Users\Ahmed\Downloads\New folder (2)\call_center_english_ai"
```

Or if that doesn't work, use:
```powershell
cd C:\Users\Ahmed\Downloads
cd "New folder (2)"
cd call_center_english_ai
```

**Verify you're in the right folder:**
```powershell
ls
```

You should see files like `package.json`, `server/`, `client/`, etc.

---

## Step 5: Install Dependencies

Now run:
```powershell
pnpm install
```

**This will:**
- Download all required packages
- Create a `node_modules` folder
- Take 2-3 minutes

**You should see:**
```
✓ Packages installed successfully
✓ 150+ packages downloaded
```

---

## Step 6: Create `.env` File

### Using VS Code

1. **In VS Code**, right-click on the project folder in the left sidebar
2. **Select "New File"**
3. **Name it `.env`**
4. **Copy this content:**

```
DATABASE_URL=postgresql://call_center_user:call_center_password@localhost:5432/call_center_english_ai
JWT_SECRET=your-secret-key-change-this-in-production
OPENAI_API_KEY=sk-your-openai-key-here
VITE_API_URL=http://localhost:5000
VITE_APP_TITLE=Call Center English AI Trainer
```

5. **Save the file** (Ctrl + S)

### Using PowerShell (Alternative)

```powershell
# Create the file
New-Item -Path ".env" -ItemType File

# Edit it with Notepad
notepad .env
```

Then paste the content above and save.

---

## Step 7: Install PostgreSQL (Windows)

### Download PostgreSQL

1. **Go to:** https://www.postgresql.org/download/windows/
2. **Click "Download the installer"**
3. **Download version 14 or higher**
4. **Run the installer**

### Installation Steps

1. **Accept the license**
2. **Choose installation directory** (default is fine)
3. **Select components:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Stack Builder
   - ✅ Command Line Tools
4. **Set password for postgres user:** Remember this!
5. **Port:** Keep as 5432
6. **Locale:** Select your locale
7. **Click "Install"**
8. **Finish the installation**

### Create Database

1. **Open pgAdmin 4** (should have been installed with PostgreSQL)
2. **Log in with the password you set**
3. **Right-click "Databases"** in the left panel
4. **Select "Create" → "Database"**
5. **Name:** `call_center_english_ai`
6. **Click "Save"**

### Create Database User

1. **Right-click "Login/Group Roles"** in the left panel
2. **Select "Create" → "Login/Group Role"**
3. **Name:** `call_center_user`
4. **Go to "Definition" tab**
5. **Set Password:** `call_center_password`
6. **Go to "Privileges" tab**
7. **Enable all privileges**
8. **Click "Save"**

---

## Step 8: Start the Backend Server

In PowerShell (in your project folder):

```powershell
pnpm dev:server
```

**You should see:**
```
✓ Server running on http://localhost:5000
✓ Database connected successfully
```

**If you get a database error:**
- Make sure PostgreSQL is running
- Check the database and user were created correctly
- Verify the `.env` file has the correct connection string

---

## Step 9: Start the Frontend Server

**Open a new PowerShell window** (don't close the backend one!)

Navigate to your project folder again:
```powershell
cd "C:\Users\Ahmed\Downloads\New folder (2)\call_center_english_ai"
```

Then run:
```powershell
pnpm dev:client
```

**You should see:**
```
✓ Frontend running on http://localhost:5173
```

---

## Step 10: Open in Browser

1. **Open your web browser** (Chrome, Firefox, Edge, etc.)
2. **Go to:** `http://localhost:5173`
3. **You should see the login page!** 🎉

---

## Step 11: Create Your Account

1. **Click "Sign Up"**
2. **Fill in:**
   - Name: Your Name
   - Email: test@example.com
   - Password: TestPassword123
3. **Click "Create Account"**
4. **Log in with your credentials**
5. **Explore the platform!** 🎊

---

## Common Windows Issues & Solutions

### Issue: "pnpm: The term 'pnpm' is not recognized"

**Solution:**
```powershell
# Install pnpm globally
npm install -g pnpm

# Close and reopen PowerShell
# Then verify
pnpm --version
```

---

### Issue: "Cannot find module 'node_modules'"

**Solution:**
```powershell
# Make sure you're in the project folder
cd "C:\Users\Ahmed\Downloads\New folder (2)\call_center_english_ai"

# Reinstall dependencies
pnpm install
```

---

### Issue: "Port 5000 already in use"

**Solution:**
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number)
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=5001
pnpm dev:server
```

---

### Issue: "PostgreSQL connection failed"

**Solution:**

1. **Check if PostgreSQL is running:**
   - Open Services (press Windows + R, type "services.msc")
   - Look for "postgresql-x64-14" or similar
   - If stopped, right-click and select "Start"

2. **Verify connection string in `.env`:**
   ```
   DATABASE_URL=postgresql://call_center_user:call_center_password@localhost:5432/call_center_english_ai
   ```

3. **Test connection:**
   ```powershell
   # Install psql if not already installed
   # Then test
   psql -U call_center_user -d call_center_english_ai -c "SELECT 1;"
   ```

---

### Issue: "Frontend can't connect to backend"

**Solution:**

1. **Make sure both servers are running:**
   - Backend terminal should show: "Server running on http://localhost:5000"
   - Frontend terminal should show: "Frontend running on http://localhost:5173"

2. **Check `.env` file:**
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Restart both servers:**
   - Press Ctrl + C in both terminals
   - Start backend: `pnpm dev:server`
   - Start frontend: `pnpm dev:client`

---

## Quick Reference Commands

| Command | What it does |
|---------|-------------|
| `node --version` | Check Node.js version |
| `npm --version` | Check npm version |
| `pnpm --version` | Check pnpm version |
| `npm install -g pnpm` | Install pnpm globally |
| `pnpm install` | Install project dependencies |
| `pnpm dev:server` | Start backend server |
| `pnpm dev:client` | Start frontend server |
| `cd "folder name"` | Navigate to folder |
| `ls` | List files in current folder |

---

## Folder Structure on Windows

Your project should be at:
```
C:\Users\Ahmed\Downloads\New folder (2)\call_center_english_ai\
├── server/
├── client/
├── db/
├── scripts/
├── package.json
├── .env (create this)
└── ... other files
```

---

## You're All Set! 🎉

Once you complete all steps:
- ✅ Node.js installed
- ✅ pnpm installed
- ✅ Dependencies installed
- ✅ PostgreSQL running
- ✅ Backend server running
- ✅ Frontend server running
- ✅ Application accessible at http://localhost:5173

**Next:** Create your account and start exploring!

---

## Need Help?

1. **Check the error message** - Read what it says
2. **Look at the terminal output** - It usually tells you what's wrong
3. **Try restarting** - Close and reopen PowerShell/VS Code
4. **Check the troubleshooting section** above
5. **Verify setup** - Make sure all steps were completed

---

**Happy Learning!** 🚀

**Last Updated:** November 17, 2025  
**Status:** ✅ Windows Setup Guide
