#!/bin/bash

# Call Center English AI - Production Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
PROJECT_DIR="/opt/call_center_english_ai"
LOG_FILE="/var/log/call_center_ai/deployment.log"
BACKUP_DIR="/backups/app"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v node >/dev/null 2>&1 || error "Node.js is not installed"
    command -v pnpm >/dev/null 2>&1 || error "pnpm is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    command -v pm2 >/dev/null 2>&1 || error "PM2 is not installed"
    
    log "All prerequisites met"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    cd "$PROJECT_DIR"
    tar -czf "$BACKUP_FILE" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=uploads \
        --exclude=audio_output \
        --exclude=logs \
        .
    
    log "Backup created: $BACKUP_FILE"
    
    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +6 | xargs -r rm
}

# Pull latest code
pull_code() {
    log "Pulling latest code from repository..."
    
    cd "$PROJECT_DIR"
    git fetch origin
    git checkout "$VERSION"
    git pull origin "$VERSION"
    
    log "Code updated to version: $VERSION"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$PROJECT_DIR"
    pnpm install --frozen-lockfile
    
    log "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$PROJECT_DIR"
    pnpm build
    
    log "Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "$PROJECT_DIR"
    pnpm db:push
    
    log "Database migrations completed"
}

# Stop application
stop_application() {
    log "Stopping application..."
    
    pm2 stop call-center-ai || warning "Application was not running"
    
    log "Application stopped"
}

# Start application
start_application() {
    log "Starting application..."
    
    cd "$PROJECT_DIR"
    pm2 start "pnpm start" --name "call-center-ai" --env "$ENVIRONMENT"
    pm2 save
    
    log "Application started"
}

# Health check
health_check() {
    log "Performing health check..."
    
    sleep 5
    
    for i in {1..10}; do
        if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
            log "Health check passed"
            return 0
        fi
        warning "Health check attempt $i/10 failed, retrying..."
        sleep 3
    done
    
    error "Health check failed after 10 attempts"
}

# Rollback
rollback() {
    error_msg=$1
    log "Deployment failed: $error_msg"
    warning "Rolling back to previous version..."
    
    cd "$PROJECT_DIR"
    git reset --hard HEAD~1
    pnpm install --frozen-lockfile
    pnpm build
    pnpm db:push
    
    stop_application
    start_application
    
    error "Deployment rolled back due to: $error_msg"
}

# Notify deployment
notify_deployment() {
    status=$1
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"Deployment $status\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \"*Deployment $status*\nEnvironment: $ENVIRONMENT\nVersion: $VERSION\nTime: $(date)\"
                        }
                    }
                ]
            }"
    fi
}

# Main deployment flow
main() {
    log "Starting deployment to $ENVIRONMENT environment"
    log "Version: $VERSION"
    
    trap 'rollback "Script interrupted"' INT TERM
    
    check_prerequisites
    create_backup
    pull_code
    install_dependencies
    build_application
    run_migrations
    stop_application
    start_application
    health_check
    
    log "Deployment completed successfully"
    notify_deployment "successful"
}

# Run main function
main "$@"
