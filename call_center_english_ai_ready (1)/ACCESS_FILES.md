# How to Access Your Project Files

Your Call Center English AI Platform files are located at:
```
/home/ubuntu/call_center_english_ai
```

Here are all the ways you can access them:

---

## Method 1: Download All Files (Easiest)

### Using the Management Dashboard

1. **Click the "Code" button** in the Management UI (right panel)
2. **Click "Download All Files"** button
3. All files will be downloaded as a ZIP file to your computer
4. Extract the ZIP file to your desired location

This is the **easiest way** to get all files on your computer!

---

## Method 2: View Files in the Management Dashboard

### Using the File Explorer

1. **Open the Management UI** (click the icon in the top right)
2. **Click "Code" tab**
3. You'll see a file tree showing:
   - `server/` - Backend code
   - `client/` - Frontend code
   - `db/` - Database schema
   - `scripts/` - Deployment scripts
   - Configuration files
   - Documentation files

4. **Click any file** to view its contents
5. **Click the download icon** next to a file to download just that file

---

## Method 3: Command Line Access

### View File Structure

```bash
# Navigate to project
cd /home/ubuntu/call_center_english_ai

# List all files
ls -la

# View directory structure
tree -L 2

# Or use find command
find . -type f -name "*.md" | head -20
```

### View Specific Files

```bash
# View a file
cat QUICK_START.md

# View with line numbers
cat -n server/index.ts | head -50

# View with less (scroll with arrow keys)
less PRODUCTION_DEPLOYMENT.md

# Search in files
grep -r "OPENAI_API_KEY" . --include="*.ts" --include="*.md"
```

### Copy Files to Your Computer

```bash
# Copy entire project to Downloads
cp -r /home/ubuntu/call_center_english_ai ~/Downloads/

# Copy specific file
cp /home/ubuntu/call_center_english_ai/QUICK_START.md ~/Downloads/

# Create a ZIP file
cd /home/ubuntu
zip -r call_center_english_ai.zip call_center_english_ai/
# Then download from ~/call_center_english_ai.zip
```

---

## Method 4: Using Git (If You Have Git)

### Clone to Your Computer

```bash
# Clone the project (if it's on GitHub)
git clone https://github.com/your-username/call_center_english_ai.git

# Or initialize as a new repository
cd /home/ubuntu/call_center_english_ai
git init
git add .
git commit -m "Initial commit"
```

---

## Method 5: View in Code Editor

### Using VS Code (Recommended)

1. **Install VS Code** on your computer (if not already installed)
2. **Open the project folder:**
   - File → Open Folder
   - Navigate to where you downloaded/extracted the files
   - Select `call_center_english_ai` folder
   - Click "Open"

3. **You'll see the complete file structure** in the left sidebar
4. **Click any file** to view and edit it
5. **Use Ctrl+P** to search for files

### Using Other Editors

- **WebStorm/IntelliJ IDEA:** File → Open → Select project folder
- **Sublime Text:** File → Open Folder → Select project folder
- **Atom:** File → Add Project Folder → Select project folder

---

## File Organization Guide

Here's what each folder contains:

### **`server/`** - Backend Code
```
server/
├── index.ts              # Main Express server
├── db.ts                 # Database connection
├── middleware/           # Authentication, uploads
├── routes/               # API endpoints
│   ├── auth.ts          # Login/signup
│   ├── users.ts         # User management
│   ├── lessons.ts       # Lessons API
│   ├── ai.ts            # Speaking practice
│   ├── tts.ts           # Text-to-speech
│   └── ...
└── services/            # Business logic
    ├── openai.ts        # OpenAI integration
    ├── whisper.ts       # Speech-to-text
    └── tts.ts           # Text-to-speech
```

### **`client/`** - Frontend Code
```
client/
├── src/
│   ├── App.tsx          # Main component
│   ├── main.tsx         # Entry point
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LessonsPage.tsx
│   │   ├── SpeakingPracticePage.tsx
│   │   ├── QuizzesPage.tsx
│   │   ├── ProgressPage.tsx
│   │   └── AssessmentPage.tsx
│   ├── components/      # Reusable components
│   │   ├── Navigation.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── ProtectedRoute.tsx
│   └── services/        # API clients
│       ├── api.ts       # API client
│       └── tts.ts       # TTS client
└── index.html           # HTML template
```

### **`db/`** - Database
```
db/
├── schema.ts            # Database schema (11 tables)
└── migrations/          # SQL migrations
    └── 0001_*.sql      # Generated migrations
```

### **`scripts/`** - Deployment Scripts
```
scripts/
├── deploy.sh            # Automated deployment
├── backup-db.sh         # Database backup
└── restore-db.sh        # Database restore
```

### **Documentation Files**
```
QUICK_START.md                          # Start here!
PRODUCTION_READY.md                     # Production overview
PRODUCTION_DEPLOYMENT.md                # Deployment guide
PRODUCTION_CHECKLIST.md                 # Pre-deployment checklist
MONITORING_SETUP.md                     # Monitoring guide
IMPLEMENTATION_COMPLETE.md              # Project summary
DATABASE_INTEGRATION_COMPLETE.md        # Database guide
OPENAI_INTEGRATION.md                   # OpenAI API guide
WHISPER_INTEGRATION.md                  # Whisper API guide
TTS_INTEGRATION.md                      # Text-to-speech guide
```

---

## Important Files to Know

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.production` | Production config | ✅ Yes |
| `.env` | Development config | ✅ Yes |
| `Dockerfile` | Docker setup | ⚠️ Advanced |
| `docker-compose.yml` | Docker Compose | ⚠️ Advanced |
| `package.json` | Dependencies | ⚠️ Advanced |
| `tsconfig.json` | TypeScript config | ⚠️ Advanced |
| `vite.config.ts` | Frontend build config | ⚠️ Advanced |
| `drizzle.config.ts` | Database config | ⚠️ Advanced |

---

## Quick File Access Commands

### View Documentation
```bash
# View Quick Start
cat /home/ubuntu/call_center_english_ai/QUICK_START.md

# View Production Guide
cat /home/ubuntu/call_center_english_ai/PRODUCTION_DEPLOYMENT.md

# View all markdown files
ls -1 /home/ubuntu/call_center_english_ai/*.md
```

### View Source Code
```bash
# View server code
ls -la /home/ubuntu/call_center_english_ai/server/

# View frontend code
ls -la /home/ubuntu/call_center_english_ai/client/src/

# View routes
ls -la /home/ubuntu/call_center_english_ai/server/routes/
```

### View Configuration
```bash
# View environment template
cat /home/ubuntu/call_center_english_ai/.env.production

# View Docker config
cat /home/ubuntu/call_center_english_ai/docker-compose.yml

# View package.json
cat /home/ubuntu/call_center_english_ai/package.json
```

---

## Download Methods

### Method A: ZIP Download (Easiest)
1. Click "Code" in Management Dashboard
2. Click "Download All Files"
3. Extract ZIP on your computer

### Method B: Individual Files
1. Click "Code" in Management Dashboard
2. Click download icon next to each file
3. Files download one by one

### Method C: Command Line
```bash
# Create ZIP file
cd /home/ubuntu
zip -r call_center_english_ai.zip call_center_english_ai/

# Download using SCP (from your computer)
scp -r ubuntu@your-server:/home/ubuntu/call_center_english_ai ~/Downloads/
```

### Method D: Git Clone
```bash
# If on GitHub
git clone https://github.com/your-username/call_center_english_ai.git

# Or initialize locally
cd /home/ubuntu/call_center_english_ai
git init
git add .
git commit -m "Initial commit"
```

---

## File Sizes Reference

| Component | Size | Files |
|-----------|------|-------|
| **Backend Code** | ~500 KB | 15+ files |
| **Frontend Code** | ~300 KB | 20+ files |
| **Database Schema** | ~50 KB | 2 files |
| **Documentation** | ~800 KB | 10+ files |
| **Scripts** | ~20 KB | 3 files |
| **Configuration** | ~100 KB | 5+ files |
| **Total (without node_modules)** | ~1.8 MB | 150+ files |

---

## Recommended Setup

### For Development
1. **Download all files** to your computer
2. **Open in VS Code** or your favorite editor
3. **Install Node.js** on your computer
4. **Run locally** with `pnpm dev:server` and `pnpm dev:client`

### For Production
1. **Keep files on server** (don't download)
2. **Use deployment script:** `./scripts/deploy.sh`
3. **Monitor with:** `pm2 logs`

### For Backup
1. **Download all files** regularly
2. **Store in cloud** (Google Drive, Dropbox, etc.)
3. **Use git** for version control

---

## Next Steps

1. **Download the files** using Method 1 (easiest)
2. **Read QUICK_START.md** to understand the structure
3. **Open in VS Code** to explore the code
4. **Follow PRODUCTION_DEPLOYMENT.md** when ready to deploy

---

## Support

If you have trouble accessing files:

1. **Check permissions:** `ls -la /home/ubuntu/call_center_english_ai/`
2. **Verify path:** `pwd` then `cd /home/ubuntu/call_center_english_ai`
3. **List files:** `ls -la`
4. **View file:** `cat filename.md`

---

**All your files are ready to access!** Choose your preferred method above and get started. 🚀

**Status:** ✅ Files Ready  
**Location:** `/home/ubuntu/call_center_english_ai`  
**Last Updated:** November 17, 2025
