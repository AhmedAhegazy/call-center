# Database Setup Guide

This guide explains how to set up the PostgreSQL database for the Call Center English AI application.

## Prerequisites

- PostgreSQL 12 or higher installed
- Environment variables configured in `.env` file

## Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE call_center_english_ai;

# Create a user (optional, but recommended)
CREATE USER call_center_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE call_center_english_ai TO call_center_user;

# Exit psql
\q
```

## Step 2: Configure Environment Variables

Create a `.env` file in the project root with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://call_center_user:your_secure_password@localhost:5432/call_center_english_ai

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# OpenAI Configuration (for AI Speaking Partner)
OPENAI_API_KEY=your_openai_api_key_here

# Frontend Configuration
VITE_API_URL=http://localhost:5000
VITE_APP_TITLE=Call Center English AI Trainer
```

## Step 3: Generate Database Migrations

```bash
# Generate migrations from the schema
pnpm db:generate

# This will create migration files in db/migrations/
```

## Step 4: Run Migrations

```bash
# Push the schema to the database
pnpm db:push

# Or manually migrate
pnpm db:migrate
```

## Step 5: Verify Database Setup

```bash
# Connect to the database
psql -U call_center_user -d call_center_english_ai

# List tables
\dt

# Exit
\q
```

## Step 6: Seed Initial Data (Optional)

You can create a seed script to populate initial data like lessons and scenarios:

```bash
# Create a seed file (example)
node seed-db.mjs
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check the connection string in `.env`

### Permission Denied
- Verify the user has proper privileges
- Ensure the password is correct

### Migration Errors
- Check that the database exists
- Verify the schema file is correct
- Clear previous migrations if needed

## Database Schema Overview

The database includes the following main tables:

| Table | Purpose |
| --- | --- |
| `users` | User accounts and authentication |
| `user_progress` | Track each user's overall progress through the 3-month program |
| `skill_mastery` | Track mastery of individual skills (grammar, vocabulary, etc.) |
| `quiz_results` | Store quiz scores and results |
| `speaking_sessions` | Record speaking practice sessions with AI |
| `lessons` | Course lessons for each module and week |
| `user_lesson_progress` | Track which lessons users have completed |
| `scenarios` | Role-play scenarios for practice |
| `user_scenario_practice` | Track user attempts at scenarios |
| `assessment_results` | Final B2 assessment results |
| `certifications` | Issued B2 certifications |

## Next Steps

Once the database is set up, you can:

1. Start the development server: `pnpm dev`
2. Test the API endpoints
3. Create initial lessons and scenarios
4. Begin integrating the AI features
