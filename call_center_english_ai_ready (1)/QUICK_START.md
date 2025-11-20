# Quick Start Guide - Get Running in 5 Minutes

## Option 1: Run Locally (Development Mode) - FASTEST

### Prerequisites Check
Verify you have everything installed:

```bash
# Check Node.js
node --version  # Should be v22.x

# Check pnpm
pnpm --version  # Should be v8.x or higher

# Check PostgreSQL (should already be running from setup)
psql --version  # Should be PostgreSQL 14+
```

### Start the Application

**Terminal 1 - Start Backend:**
```bash
cd /home/ubuntu/call_center_english_ai

# Start the backend server
pnpm dev:server
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Database connected
✓ API ready
```

**Terminal 2 - Start Frontend (in a new terminal):**
```bash
cd /home/ubuntu/call_center_english_ai

# Start the frontend development server
pnpm dev:client
```

You should see:
```
✓ Frontend running on http://localhost:5173
✓ Connected to API at http://localhost:5000
```

### Access the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the login page!

---

## Option 2: Run with Docker (Production-Like)

### Start Everything with Docker Compose

```bash
cd /home/ubuntu/call_center_english_ai

# Start all services (database, backend, frontend)
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30

# Check if everything is running
docker-compose ps
```

You should see:
```
NAME                    STATUS
call-center-ai-db       Up (healthy)
call-center-ai-app      Up (healthy)
```

### Access the Application

Open your browser and go to:
```
http://localhost:5000
```

---

## First Steps - Create Your Account

### 1. Sign Up

1. Click "Sign Up" on the login page
2. Enter your details:
   - **Name:** Your Name
   - **Email:** your-email@example.com
   - **Password:** Strong password (min 8 characters)
3. Click "Create Account"

### 2. Log In

1. Enter your email and password
2. Click "Log In"
3. You should see the Dashboard

---

## Explore the Platform

### Dashboard
The dashboard shows:
- Your overall progress (0% at start)
- Current module and week
- Quick access to all features
- Learning path visualization

### Lessons
1. Click "Lessons" in the sidebar
2. Select "Module 1, Week 1"
3. View available lessons:
   - Basic Greetings
   - Common Phrases
   - Professional Communication
   - Listening Practice
   - Cultural Context

4. Click a lesson to view content
5. Click "Mark Complete" to track progress

### Speaking Practice
1. Click "Speaking Practice" in the sidebar
2. Select a scenario (e.g., "Customer Complaint")
3. Read the scenario description
4. Click "Start Recording"
5. Speak your response (30-60 seconds)
6. Click "Stop Recording"
7. Wait for AI analysis
8. View your scores and feedback

**Note:** In development mode, you'll get simulated scores. In production with OpenAI API key, you'll get real AI feedback.

### Quizzes
1. Click "Quizzes" in the sidebar
2. Select a quiz type (Grammar, Vocabulary, Listening, etc.)
3. Answer the questions
4. Submit your answers
5. View your score and explanations

### Progress
1. Click "Progress" in the sidebar
2. See your overall progress
3. View skill mastery scores
4. Check your learning timeline
5. Get personalized recommendations

### Assessment
1. Click "Assessment" in the sidebar
2. Take the B2 certification exam
3. Complete all sections
4. Submit for evaluation
5. Get your B2 certification (if passing)

---

## Test with Sample Data

The platform comes pre-loaded with sample data:

### Sample Scenarios
- **Customer Complaint** (Beginner)
- **Technical Support** (Intermediate)
- **Sales Call** (Advanced)
- **Billing Issue** (Intermediate)
- **Account Recovery** (Advanced)
- **Feedback Request** (Beginner)
- **Complaint Escalation** (Advanced)
- **Refund Request** (Intermediate)

### Sample Lessons
- Grammar fundamentals
- Vocabulary building
- Listening comprehension
- Speaking practice
- Cultural communication

### Sample Quizzes
- Grammar quizzes
- Vocabulary quizzes
- Listening quizzes
- Cultural awareness quizzes

---

## Useful Commands

### View Logs
```bash
# Backend logs
pm2 logs call-center-ai

# Frontend logs (check terminal where you ran pnpm dev:client)

# Docker logs
docker-compose logs -f call-center-ai-app
```

### Database Access
```bash
# Connect to database
PGPASSWORD=call_center_password psql -U call_center_user -d call_center_english_ai

# View users
SELECT id, email, name FROM users;

# View progress
SELECT user_id, module, week, mastery_score FROM userProgress;

# Exit
\q
```

### Restart Services
```bash
# Restart backend
pm2 restart call-center-ai

# Restart Docker
docker-compose restart call-center-ai-app

# Stop all services
docker-compose down
```

### Check Health
```bash
# Backend health
curl http://localhost:5000/api/health

# Should return:
# {"status":"ok","database":"ok","uptime":...}
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL if not running
sudo service postgresql start

# Test connection
PGPASSWORD=call_center_password psql -U call_center_user -d call_center_english_ai -c "SELECT 1;"
```

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5001 pnpm dev:server
```

### Issue: "Frontend can't connect to backend"
**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check frontend .env
cat /home/ubuntu/call_center_english_ai/client/.env

# Restart both services
```

### Issue: "OpenAI API key not working"
**Solution:**
```bash
# In development, the app works without OpenAI key
# For real AI features, add your key to .env:
OPENAI_API_KEY=sk-your-actual-key-here

# Restart backend
pm2 restart call-center-ai
```

---

## Next: Deploy to Production

Once you're satisfied with the local setup, deploy to production:

1. **Read:** `PRODUCTION_READY.md`
2. **Choose Platform:** AWS, DigitalOcean, Heroku, or Self-Hosted
3. **Follow Guide:** `PRODUCTION_DEPLOYMENT.md`
4. **Verify:** `PRODUCTION_CHECKLIST.md`
5. **Monitor:** `MONITORING_SETUP.md`

---

## Features You Can Try Right Now

✅ **User Authentication** - Sign up, login, profile management  
✅ **Lessons** - View and complete lessons, track progress  
✅ **Speaking Practice** - Record audio, get feedback (simulated)  
✅ **Quizzes** - Take quizzes, track scores  
✅ **Progress Tracking** - See your learning progress  
✅ **Assessment** - Take B2 certification exam  
✅ **AI Tutor** - Ask questions and get answers  

⏳ **Coming with OpenAI API Key:**
- Real speech-to-text (Whisper)
- Real AI feedback (GPT-4)
- Natural-sounding narration (TTS)
- Advanced pronunciation analysis

---

## Tips for Best Experience

1. **Use Chrome/Firefox** - Best browser compatibility
2. **Enable Microphone** - For speaking practice
3. **Good Internet** - For API calls and audio
4. **Quiet Environment** - For better audio quality
5. **Headphones** - For better audio experience

---

## Test Accounts

You can create multiple test accounts to explore the platform:

```
Account 1:
Email: student1@example.com
Password: TestPassword123

Account 2:
Email: student2@example.com
Password: TestPassword123

Account 3:
Email: student3@example.com
Password: TestPassword123
```

Each account will have independent progress tracking.

---

## What's Next?

### Short Term (This Week)
- Explore all features locally
- Test with sample data
- Verify everything works
- Gather feedback

### Medium Term (This Month)
- Add your OpenAI API key
- Deploy to production
- Set up custom domain
- Configure SSL certificate

### Long Term (This Quarter)
- Onboard first cohort of students
- Monitor performance
- Optimize based on usage
- Plan for scaling

---

## Support & Help

**If something doesn't work:**

1. Check the logs: `pm2 logs call-center-ai`
2. Verify services are running: `docker-compose ps`
3. Test API: `curl http://localhost:5000/api/health`
4. Check database: `PGPASSWORD=call_center_password psql -U call_center_user -d call_center_english_ai`
5. Restart everything: `docker-compose down && docker-compose up -d`

**Documentation:**
- API Docs: See `OPENAI_INTEGRATION.md`
- Database: See `DATABASE_INTEGRATION_COMPLETE.md`
- Deployment: See `PRODUCTION_DEPLOYMENT.md`

---

## You're All Set! 🎉

Your Call Center English AI Platform is ready to use. Start exploring and let us know if you have any questions!

**Happy Learning!** 📚

---

**Quick Links:**
- 🏠 **Home:** http://localhost:5173
- 📊 **API Health:** http://localhost:5000/api/health
- 📚 **Docs:** See included markdown files
- 🚀 **Deploy:** Follow `PRODUCTION_DEPLOYMENT.md`

**Status:** ✅ Ready to Use  
**Last Updated:** November 17, 2025
