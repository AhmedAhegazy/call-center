#!/bin/bash

# Database Restore Script
# Usage: ./scripts/restore-db.sh <backup_file>

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-call_center_english_ai_prod}
DB_USER=${DB_USER:-app_user}

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/restore-db.sh <backup_file>"
    echo "Example: ./scripts/restore-db.sh /backups/database/db_full_20231117_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting database restore..."
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"

# Confirm restore
read -p "Are you sure you want to restore from this backup? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Create backup of current database before restore
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Creating safety backup of current database..."
SAFETY_BACKUP="/backups/database/db_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
mkdir -p /backups/database

PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" | gzip > "$SAFETY_BACKUP"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Safety backup created: $SAFETY_BACKUP"

# Drop existing database
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Dropping existing database..."
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;"

# Create new database
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Creating new database..."
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restore from backup
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restoring database from backup..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME"

# Verify restore
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Verifying restore..."
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restore completed successfully"
    echo "Tables restored: $TABLE_COUNT"
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restore verification failed"
    exit 1
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Database restore process completed"
