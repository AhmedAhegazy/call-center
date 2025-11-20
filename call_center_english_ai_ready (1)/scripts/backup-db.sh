#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-db.sh [backup_type]

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-call_center_english_ai_prod}
DB_USER=${DB_USER:-app_user}
BACKUP_DIR=${BACKUP_DIR:-/backups/database}
RETENTION_DAYS=${RETENTION_DAYS:-30}
BACKUP_TYPE=${1:-full}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting database backup..."

# Perform backup
if [ "$BACKUP_TYPE" = "full" ]; then
    # Full database dump
    PGPASSWORD=$DB_PASSWORD pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --format=plain | gzip > "$BACKUP_FILE"
    
elif [ "$BACKUP_TYPE" = "schema" ]; then
    # Schema only
    PGPASSWORD=$DB_PASSWORD pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --schema-only | gzip > "$BACKUP_FILE"
    
elif [ "$BACKUP_TYPE" = "data" ]; then
    # Data only
    PGPASSWORD=$DB_PASSWORD pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --data-only | gzip > "$BACKUP_FILE"
else
    echo "Invalid backup type. Use: full, schema, or data"
    exit 1
fi

# Verify backup
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup failed!"
    exit 1
fi

# Get backup size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup completed: $BACKUP_FILE ($SIZE)"

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://${AWS_S3_BUCKET}/backups/"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Upload completed"
fi

# Cleanup old backups
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Cleaning up old backups..."
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup process completed"
