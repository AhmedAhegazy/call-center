# VS Code Setup Guide - Getting Started

Great! You've opened the project in VS Code. Here's exactly what to do next:

---

## Step 1: Install Dependencies

### Open Terminal in VS Code

1. **Press `Ctrl + `` (backtick)** or go to **Terminal → New Terminal**
2. You should see a terminal at the bottom of VS Code
3. Make sure you're in the project folder (you should see the path ending with `call_center_english_ai`)

### Install All Dependencies

```bash
pnpm install
```

**What this does:**
- Downloads all required packages (React, Express, database tools, etc.)
- Creates a `node_modules` folder
- Takes about 2-3 minutes

**You'll see:**
```
✓ Packages installed successfully
✓ 150+ packages downloaded
```

---

## Step 2: Set Up Environment Variables

### Create `.env` File

1. **Right-click on the project folder** in VS Code (left sidebar)
2. **Select "New File"**
3. **Name it `.env`** (just the dot and "env")
4. **Copy this content:**

```
# Database
DATABASE_URL=postgresql://call_center_user:call_center_password@localhost:5432/call_center_english_ai

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# OpenAI (optional - for real AI features)
OPENAI_API_KEY=sk-your-openai-key-here

# Frontend
VITE_API_URL=http://localhost:5000
VITE_APP_TITLE=Call Center English AI Trainer
```

5. **Save the file** (Ctrl + S)

**Note:** These are development settings. For production, you'll use `.env.production`

---

## Step 3: Start the Backend Server

### In the Terminal

```bash
pnpm dev:server
```

**You should see:**
```
✓ Server running on http://localhost:5000
✓ Database connected successfully
✓ API ready
```

**If you see an error:**
- Make sure PostgreSQL is running
- Check that the database exists
- See "Troubleshooting" section below

---

## Step 4: Start the Frontend Server

### Open a New Terminal

1. **Press `Ctrl + Shift + `` (backtick)** to open another terminal
2. Or click the **+** button next to the terminal tab

### Run Frontend

```bash
pnpm dev:client
```

**You should see:**
```
✓ Frontend running on http://localhost:5173
✓ Connected to API at http://localhost:5000
```

---

## Step 5: Open in Browser

### Access the Application

1. **Open your web browser**
2. **Go to:** `http://localhost:5173`
3. **You should see the login page!** 🎉

---

## Step 6: Create Your Account

### Sign Up

1. Click **"Sign Up"** link
2. Fill in:
   - **Name:** Your Name
   - **Email:** test@example.com
   - **Password:** TestPassword123
3. Click **"Create Account"**
4. You'll be redirected to login

### Log In

1. Enter your email and password
2. Click **"Log In"**
3. You should see the **Dashboard**! 🎊

---

## What You Can Do Now

### 📚 Lessons
- Click "Lessons" in the sidebar
- View pre-loaded lessons
- Mark lessons as complete
- Track your progress

### 🎤 Speaking Practice
- Click "Speaking Practice"
- Select a scenario
- Record your voice
- Get AI feedback (simulated in development)

### ❓ Quizzes
- Click "Quizzes"
- Take grammar, vocabulary, or listening quizzes
- See your scores

### 📊 Progress
- Click "Progress"
- View your learning analytics
- See skill mastery scores

### 🏆 Assessment
- Click "Assessment"
- Take the B2 certification exam
- Get your score

### 🤖 AI Tutor
- Click "AI Tutor"
- Ask questions about English
- Get instant answers

---

## Useful VS Code Tips

### View File Structure
- **Left Sidebar** shows all files and folders
- Click any file to open it
- Use **Ctrl + P** to search for files

### Edit Files
- Click any file to open it
- Make changes
- Press **Ctrl + S** to save

### View Logs
- **Terminal** at the bottom shows server logs
- Look for errors or important messages
- Use **Ctrl + L** to clear terminal

### Debug
- Press **F5** to start debugging (if configured)
- Set breakpoints by clicking line numbers
- Use **Debug Console** to inspect variables

---

## Troubleshooting

### Issue: "Cannot find module 'pnpm'"

**Solution:**
```bash
npm install -g pnpm
```

Then try again:
```bash
pnpm install
```

---

### Issue: "Database connection failed"

**Solution:**

1. **Check if PostgreSQL is running:**
   ```bash
   # On Windows
   # Open Services and look for PostgreSQL
   
   # On Mac
   brew services list
   
   # On Linux
   sudo service postgresql status
   ```

2. **Start PostgreSQL if not running:**
   ```bash
   # On Mac
   brew services start postgresql
   
   # On Linux
   sudo service postgresql start
   ```

3. **Verify database exists:**
   ```bash
   psql -U call_center_user -d call_center_english_ai -c "SELECT 1;"
   ```

4. **If database doesn't exist, create it:**
   ```bash
   psql -U postgres -c "CREATE DATABASE call_center_english_ai;"
   psql -U postgres -c "CREATE USER call_center_user WITH PASSWORD 'call_center_password';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE call_center_english_ai TO call_center_user;"
   ```

---

### Issue: "Port 5000 already in use"

**Solution:**

```bash
# Find what's using port 5000
# On Mac/Linux
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5001 pnpm dev:server
```

---

### Issue: "Port 5173 already in use"

**Solution:**

```bash
# Find what's using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or let Vite use a different port (it will auto-select)
```

---

### Issue: "Frontend can't connect to backend"

**Solution:**

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check `.env` file:**
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Restart both servers:**
   - Stop backend: Press **Ctrl + C** in backend terminal
   - Stop frontend: Press **Ctrl + C** in frontend terminal
   - Start backend again: `pnpm dev:server`
   - Start frontend again: `pnpm dev:client`

---

### Issue: "Login not working"

**Solution:**

1. **Check browser console for errors:**
   - Press **F12** in browser
   - Click **Console** tab
   - Look for error messages

2. **Check backend logs:**
   - Look at the backend terminal
   - Search for error messages

3. **Verify database has users:**
   ```bash
   psql -U call_center_user -d call_center_english_ai -c "SELECT * FROM users;"
   ```

---

## File Structure to Know

```
call_center_english_ai/
├── server/                    ← Backend code
│   ├── index.ts              ← Main server file
│   ├── routes/               ← API endpoints
│   └── services/             ← Business logic
├── client/                    ← Frontend code
│   ├── src/
│   │   ├── pages/            ← Page components
│   │   ├── components/       ← Reusable components
│   │   └── App.tsx           ← Main component
│   └── index.html            ← HTML template
├── db/                        ← Database
│   ├── schema.ts             ← Database schema
│   └── migrations/           ← SQL migrations
├── .env                       ← Environment variables (create this)
├── package.json              ← Dependencies
└── Documentation files       ← Guides and references
```

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev:server` | Start backend server |
| `pnpm dev:client` | Start frontend server |
| `pnpm build` | Build for production |
| `pnpm db:push` | Run database migrations |
| `pnpm lint` | Check code quality |

---

## Next Steps

### Short Term (Today)
1. ✅ Open project in VS Code
2. ✅ Install dependencies
3. ✅ Set up `.env` file
4. ✅ Start backend and frontend
5. ✅ Create account and explore

### Medium Term (This Week)
- Test all features
- Explore the code
- Understand the structure
- Try making small changes

### Long Term (This Month)
- Add OpenAI API key for real AI features
- Deploy to production
- Customize for your needs
- Start onboarding users

---

## Tips for Success

1. **Keep both terminals open** - You need backend AND frontend running
2. **Check the logs** - If something doesn't work, look at the terminal output
3. **Use Ctrl + C** - To stop a server gracefully
4. **Refresh browser** - If frontend doesn't update, press F5
5. **Check `.env`** - Make sure all variables are set correctly

---

## Getting Help

### If Something Doesn't Work

1. **Check the error message** - Read what it says carefully
2. **Look at the logs** - Backend and frontend terminals show errors
3. **Try restarting** - Stop and start servers again
4. **Check the docs** - See `QUICK_START.md` and `PRODUCTION_DEPLOYMENT.md`
5. **Verify setup** - Make sure PostgreSQL is running and database exists

---

## You're All Set! 🎉

You now have:
- ✅ Project opened in VS Code
- ✅ All dependencies installed
- ✅ Environment configured
- ✅ Backend running
- ✅ Frontend running
- ✅ Application accessible at http://localhost:5173

**Next:** Create your account and start exploring the platform!

---

**Happy Coding!** 🚀

If you have any questions, refer to the documentation files included in the project or check the troubleshooting section above.

**Last Updated:** November 17, 2025  
**Status:** ✅ Ready to Use
