# Setup, Install & Management

Comprehensive instructions for installing, configuring, running, and maintaining the Strelitzia (AnimeStream) project. This guide covers the `api`, `web`, and `transcoder` services, database setup, object storage, Docker usage, production deployment recommendations, security hardening, backups, and routine maintenance.

Last updated: December 12, 2025

## Table of Contents

- Prerequisites
- Repository layout
- Environment variables
- Local development
- Docker Compose (local & production)
- Production deployment notes
- Security best-practices
- Backups & maintenance
- Database migrations (Prisma)
- CI / CD
- Troubleshooting & useful commands

---

## Prerequisites

Install the following tools before attempting to run or deploy the project:

- Git
- Node.js 18+ (LTS) and `npm` or `pnpm`/`yarn`
- Docker & Docker Compose
- PostgreSQL (or use the Postgres container supplied in compose)
- Redis (or use the Redis container supplied in compose)
- MinIO (S3-compatible) or other S3 provider for object storage
- FFmpeg (for transcoder usage)

On Debian/Ubuntu:

```bash
sudo apt update
sudo apt install -y git curl build-essential docker.io docker-compose nodejs npm ffmpeg
```

---

## Repository layout

- `api/` — NestJS backend
- `web/` — Next.js frontend
- `transcoder/` — Worker for video transcoding
- `prisma/` — Prisma schema & migrations
- `scripts/` — Utilities (placeholders, converters, downloaders)
- `docker-compose.yml` — orchestration for local or server

---

## Environment variables

Each subproject includes a `.env.example`. Create local or production env files from those examples and keep them out of version control.

Examples to copy:

```bash
cp api/.env.example api/.env.local
cp web/.env.example web/.env.local
cp transcoder/.env.example transcoder/.env.local
```

Key variables to set (examples):

- `DATABASE_URL` — Postgres connection URI
- `REDIS_URL` — Redis connection URI
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
- `JWT_PRIVATE_KEY` — strong secret for token signing
- `NEXT_PUBLIC_API_URL` — frontend → API base URL

Security notes:

- Never commit `.env` files with secrets. `.gitignore` excludes `.env*`.
- Use a secrets manager or OS-level protected files for production environments.

---

## Local development

Recommended: use `docker compose` to run DB, Redis, and MinIO, then run the services either via compose or locally for debugging.

1) Prepare env files (see above)

2) Start supporting services with Docker Compose (Postgres, Redis, MinIO):

```bash
docker compose up -d postgres redis minio
```

3) Start API (NestJS)

Option A — via Docker Compose (recommended):

```bash
docker compose up -d api
```

Option B — locally (for development/debugging):

```bash
cd api
npm install
npm run build
npm run start
```

4) Start Web (Next.js)

Option A — via Docker Compose:

```bash
docker compose up -d web
```

Option B — locally:

```bash
cd web
npm install
npm run dev
```

5) Start Transcoder

```bash
docker compose up -d transcoder
# or run manually:
cd transcoder
npm install
node worker.js
```

6) Access the application

- Frontend: http://localhost:3000
- API: http://localhost:4000/api

---

## Docker Compose (commands)

```bash
# Start all services
docker compose up

# Start detached
docker compose up -d

# Build & start
docker compose up -d --build

# Stop
docker compose down

# Logs
docker compose logs -f api
```

When using Compose for production, store `.env` or env files outside the repository and supply them securely.

---

## Production deployment notes

Deployment patterns supported:

- Docker Compose on a VM (systemd wrapper recommended)
- Kubernetes (convert compose to manifests/Helm chart)
- Split deployment: host frontend on CDN or hosting service and API + worker in containers

Production checklist:

- Use TLS (reverse proxy or load balancer)
- Ensure HSTS, CSP, and other headers are configured
- Set `NODE_ENV=production` across services
- Store secrets in a secure store (not in repo)
- Configure logging and backups

Example systemd service (simple wrapper for docker compose):

```ini
[Unit]
Description=Strelitzia Docker Compose
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/srv/strelitzia
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
```

---

## Security best-practices

- Use HTTPS + HSTS and terminate TLS at a proxy
- Keep secrets out of the repo
- Rotate keys and passwords periodically
- Remove or restrict `'unsafe-inline'` and `'unsafe-eval'` from CSP where possible
- Ensure backend cookie flags: `HttpOnly`, `Secure` (in prod), `SameSite=Lax` or `Strict`
- Rate-limit authentication endpoints and file uploads (API includes rate-limiting middleware)
- Use `helmet`, input validation and CSRF protection (API already configured)

---

## Backups & maintenance

Postgres backups (example using `pg_dump`):

```bash
pg_dump --format=custom "$DATABASE_URL" > /backup/strelitzia-$(date -I).dump
```

Sync object storage (MinIO) to an external durable bucket:

```bash
mc alias set myminio http://minio:9000 $S3_ACCESS_KEY $S3_SECRET_KEY
mc mirror myminio/strelitzia s3/my-backups/strelitzia
```

Prisma migrations (deploy):

```bash
cd api
npx prisma migrate deploy
```

Cleanup and pruning (Docker):

```bash
docker image prune -af
docker volume prune -f
```

---

## Database migrations (Prisma)

Create migration locally after schema edits:

```bash
cd prisma
npx prisma migrate dev --name "describe-change"
```

Commit the migration files. Deploy migrations in production:

```bash
cd api
npx prisma migrate deploy
```

Always backup the database before applying production migrations.

---

## CI / CD

- Suggested CI: lint → test → build artifacts → publish Docker images
- Suggested CD: pull new image on server, run migrations, then restart services
- There is a sample workflow in `.github/workflows/ci.yml` — extend for publishing to your registry.

---

## Troubleshooting & useful commands

- View logs:
  ```bash
  docker compose logs -f api
  journalctl -u strelitzia -f
  ```
- Run the frontend build locally:
  ```bash
  cd web
  npm install
  npm run build
  npm run start
  ```
- Inspect database:
  ```bash
  psql "$DATABASE_URL"
  ```

Common issues

- Missing `.env` variables: copy `.env.example` into `.env.local` and edit values.
- CORS / CSRF failures: ensure `NEXT_PUBLIC_API_URL` and cookie settings match the deployed domain and scheme.
- Docker port conflicts: change ports in `docker-compose.yml` or stop conflicting services.

---

## Asset management & scripts

- Scripts in `scripts/` help with converting external wallpaper URLs to local paths, downloading wallpapers, and generating SVG placeholders.

Examples:

```bash
# Generate placeholders
node scripts/generate-placeholders-from-data.js

# Convert URLs
node scripts/convert-urls.js

# Download wallpapers (network required)
node scripts/download-wallpapers.js
```

---

## Final pre-production checklist

- [ ] Files with production secrets are configured on the server (not in repo)
- [ ] TLS/HTTPS configured
- [ ] Backups running and tested
- [ ] Monitoring & alerts configured
- [ ] Migrations applied and tested in staging

---

Deployment artifacts have been included in this repository for convenience:

- `deploy/nginx/strelitzia.conf` — example nginx reverse-proxy configuration (update domain/cert paths before use)
- `deploy/systemd/` — example systemd units: `strelitzia-api.service`, `strelitzia-web.service`, `strelitzia-transcoder.service`, `strelitzia-docker.service`
- `scripts/backup-strelitzia.sh` — automated Postgres backup script (gzip + optional S3/MinIO upload)

Review and customize these files before using in production.


### Network Requirements
- [ ] Port 3000 available (Next.js frontend)
- [ ] Port 5000 available (NestJS API)
- [ ] Port 5432 available (PostgreSQL)
- [ ] Port 6379 available (Redis)
- [ ] Port 80 available (HTTP)
- [ ] Port 443 available (HTTPS/SSL)

---

## System Setup

### 1. Update System Packages

```bash
# Update package manager
sudo apt-get update
sudo apt-get upgrade -y

# Install essential build tools
sudo apt-get install -y build-essential curl wget git vim
```

### 2. Install Node.js

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs

# Verify installation
node --version    # Should be v18.x.x or higher
npm --version     # Should be 9.x.x or higher
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres createuser strelitzia_user --createdb --password

# Create database
sudo -u postgres createdb strelitzia_db --owner strelitzia_user

# Verify
sudo -u postgres psql -c "\l"  # List databases
```

### 4. Install Redis

```bash
# Install Redis
sudo apt-get install -y redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return "PONG"
```

### 5. Install FFmpeg

```bash
# Install FFmpeg
sudo apt-get install -y ffmpeg

# Verify
ffmpeg -version

# Verify location
which ffmpeg  # Should be /usr/bin/ffmpeg
```

### 6. Install Docker (Optional)

```bash
# Install Docker
sudo apt-get install -y docker.io docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify
docker --version
docker-compose --version

# Relogin for group changes to take effect
newgrp docker
```

---

## Installation Steps

### 1. Clone and Navigate to Project

```bash
# Navigate to project
cd /path/to/strelitzia-server/anime

# Verify structure
ls -la
# Should show: api/, web/, transcoder/, prisma/, docker-compose.yml, etc.
```

### 2. Install API Dependencies

```bash
# Navigate to API directory
cd api

# Install Node modules
npm install

# Build TypeScript (optional, for verification)
npm run build

# Verify critical packages installed
npm list nestjs express typeorm prisma

# Navigate back
cd ..
```

### 3. Install Frontend Dependencies

```bash
# Navigate to Web directory
cd web

# Install Node modules
npm install

# Verify critical packages installed
npm list next react tailwindcss

# Navigate back
cd ..
```

### 4. Install Transcoder Dependencies

```bash
# Navigate to Transcoder directory
cd transcoder

# Install Node modules
npm install

# Navigate back
cd ..
```

### 5. Setup Database Schema

```bash
# Navigate to project root
cd api

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Optional: Seed database (if seed file exists)
npx prisma db seed

# Verify schema
npx prisma studio  # Opens database GUI (Ctrl+C to exit)

# Navigate back
cd ..
```

---

## Project Configuration

### 1. Create Environment Files

```bash
# Copy API configuration
cp api/.env.example api/.env.local
cp api/.env.example api/.env.production

# Copy Web configuration
cp web/.env.example web/.env.local
cp web/.env.example web/.env.production

# Copy Transcoder configuration
cp transcoder/.env.example transcoder/.env.local
cp transcoder/.env.example transcoder/.env.production

# Root .env (if using Docker)
cp .env.example .env
```

### 2. Edit API Configuration (api/.env.local)

```bash
# Edit API environment
nano api/.env.local

# Key variables to configure:
# DATABASE_URL=postgresql://strelitzia_user:password@localhost:5432/strelitzia_db
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
# NODE_ENV=development
# PORT=4000
# FRONTEND_URL=http://localhost:3000
```

### 3. Edit Web Configuration (web/.env.local)

```bash
# Edit Web environment
nano web/.env.local

# Key variables to configure:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NODE_ENV=development
```

### 4. Edit Transcoder Configuration (transcoder/.env.local)

```bash
# Edit Transcoder environment
nano transcoder/.env.local

# Key variables to configure:
# REDIS_URL=redis://localhost:6379
# OUTPUT_PATH=/var/lib/transcoder/output
# FFMPEG_PATH=/usr/bin/ffmpeg
# NODE_ENV=development
```

### 5. Create Transcoder Output Directory

```bash
# Create output directory with proper permissions
sudo mkdir -p /var/lib/transcoder/output
sudo chown $USER:$USER /var/lib/transcoder/output
sudo chmod 755 /var/lib/transcoder/output

# Verify
ls -ld /var/lib/transcoder/output
```

---

## Running the Project

### Option A: Development Mode (Recommended for Setup)

#### Terminal 1: Start API

```bash
cd api
npm run start:dev

# Expected output:
# [Nest] 12345  - 12/11/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - 12/11/2025, 10:00:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] 12345  - 12/11/2025, 10:00:02 AM     LOG [RoutesResolver] AppController {/api}:
# ✓ API running on http://localhost:4000
```

#### Terminal 2: Start Frontend

```bash
cd web
npm run dev

# Expected output:
# > next dev
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

#### Terminal 3: Start Transcoder (Optional)

```bash
cd transcoder
npm run dev

# Expected output:
# Worker listening for transcoding jobs...
```

#### Terminal 4: Monitor Database

```bash
# Optional: Monitor PostgreSQL
sudo -u postgres psql strelitzia_db

# Common queries:
# \dt                    # List tables
# SELECT COUNT(*) FROM users;  # Count users
# \q                     # Exit
```

### Option B: Production Mode with Systemd

#### 1. Create Systemd Service Files

**API Service** (`/etc/systemd/system/strelitzia-api.service`):

```bash
sudo nano /etc/systemd/system/strelitzia-api.service
```

Add content:
```ini
[Unit]
Description=Strelitzia API Server
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/strelitzia-server/anime/api
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Web Service** (`/etc/systemd/system/strelitzia-web.service`):

```bash
sudo nano /etc/systemd/system/strelitzia-web.service
```

Add content:
```ini
[Unit]
Description=Strelitzia Web Server
After=network.target strelitzia-api.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/strelitzia-server/anime/web
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### 2. Enable and Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable strelitzia-api.service
sudo systemctl enable strelitzia-web.service

# Start services
sudo systemctl start strelitzia-api.service
sudo systemctl start strelitzia-web.service

# Verify status
sudo systemctl status strelitzia-api.service
sudo systemctl status strelitzia-web.service
```

### Option C: Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Verify
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## Management Tasks

### Daily Operations

#### Check Service Status

```bash
# Check all services
sudo systemctl status strelitzia-api.service
sudo systemctl status strelitzia-web.service
sudo systemctl status postgresql
sudo systemctl status redis-server

# Quick status check
systemctl is-active strelitzia-api.service
systemctl is-active strelitzia-web.service
```

#### View Application Logs

```bash
# API logs (last 50 lines, follow)
sudo journalctl -u strelitzia-api.service -n 50 -f

# Web logs
sudo journalctl -u strelitzia-web.service -n 50 -f

# Database logs
sudo journalctl -u postgresql -n 50 -f

# Redis logs
sudo journalctl -u redis-server -n 50 -f
```

#### Monitor System Resources

```bash
# CPU and Memory
top -b -n 1 | head -20

# Disk usage
df -h

# Process-specific info
ps aux | grep node

# Port usage
sudo netstat -tlnp | grep -E ':(3000|4000|5432|6379)'
```

#### Test API Health

```bash
# Health check
# curl http://localhost:4000/api/health

# Login test
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Database test
# curl http://localhost:4000/api/users

# Expected: 401 (unauthorized) or 200 with data
```

### Weekly Maintenance

#### Database Backup

```bash
# Backup database
sudo -u postgres pg_dump strelitzia_db > ~/strelitzia_backup_$(date +%Y%m%d).sql

# Verify backup
ls -lh ~/strelitzia_backup_*.sql

# Compress backup
gzip ~/strelitzia_backup_*.sql

# Move to secure location
sudo mkdir -p /var/backups/strelitzia
sudo mv ~/strelitzia_backup_*.sql.gz /var/backups/strelitzia/
```

#### Check Disk Space

```bash
# Disk usage summary
du -sh /path/to/strelitzia-server/anime/*

# Remove old logs (if applicable)
sudo journalctl --vacuum=7d  # Keep 7 days of logs

# Clean npm cache
npm cache clean --force
```

#### Update Dependencies

```bash
# Check for updates
npm outdated

# Update minor versions only (safe)
npm update

# Update to latest versions (use with caution)
npm upgrade

# Rebuild node modules
rm -rf node_modules package-lock.json
npm install
```

### Monthly Tasks

#### Database Maintenance

```bash
# Connect to database
sudo -u postgres psql strelitzia_db

# Analyze tables (optimize queries)
ANALYZE;

# Vacuum (reclaim disk space)
VACUUM;

# Reindex (improve performance)
REINDEX DATABASE strelitzia_db;

# Exit
\q
```

#### Log Rotation

```bash
# Check log size
sudo journalctl --disk-usage

# Rotate logs if needed
sudo journalctl --rotate

# Vacuum old logs
sudo journalctl --vacuum=30d  # Keep 30 days
```

#### SSL Certificate Renewal (if applicable)

```bash
# For Let's Encrypt certificates (if using Certbot)
sudo certbot renew --quiet

# Verify certificate
sudo openssl x509 -in /etc/letsencrypt/live/yourdomain/cert.pem -text -noout
```

### Quarterly Tasks

#### Security Audit

```bash
# Check for security updates
sudo apt-get upgrade --dry-run | grep -i security

# Install security updates
sudo apt-get install -y --only-upgrade postgresql postgresql-contrib
sudo apt-get install -y --only-upgrade redis-server
sudo apt-get install -y --only-upgrade nodejs

# Check Node module vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

#### Performance Review

```bash
# Database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('strelitzia_db'));"

# Table sizes
sudo -u postgres psql strelitzia_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Slow queries (if logging enabled)
sudo -u postgres psql strelitzia_db -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## Troubleshooting

### Service Won't Start

#### API Service Issues

```bash
# Check service status and errors
sudo systemctl status strelitzia-api.service
sudo journalctl -u strelitzia-api.service -n 100 -e

# Common issues:

# 1. Port already in use
sudo lsof -i :4000
kill -9 <PID>

# 2. Database connection error
# Check DATABASE_URL in .env.local
# Test connection: psql postgresql://user:pass@localhost:5432/db

# 3. Redis not running
sudo systemctl start redis-server
redis-cli ping

# 4. Node modules missing
cd api && npm install && cd ..

# 5. Build error
cd api && npm run build && cd ..
```

#### Web Service Issues

```bash
# Check logs
sudo journalctl -u strelitzia-web.service -n 100 -e

# Common issues:

# 1. API URL incorrect
# Check NEXT_PUBLIC_API_URL in .env.local

# 2. Port conflict
sudo lsof -i :3000
kill -9 <PID>

# 3. Build error
cd web && npm run build && cd ..

# 4. Clear cache
cd web && rm -rf .next && npm run dev && cd ..
```

### Database Issues

#### Connection Refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Check connection parameters
cat api/.env.local | grep DATABASE_URL

# Test connection manually
psql postgresql://user:password@localhost:5432/strelitzia_db

# Check PostgreSQL logs
sudo journalctl -u postgresql -n 50
```

#### Disk Space Error

```bash
# Check disk usage
df -h

# Find large tables
sudo -u postgres psql strelitzia_db -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Vacuum unused space
sudo -u postgres vacuumdb strelitzia_db

# Delete old data (if applicable)
# sudo -u postgres psql strelitzia_db -c "DELETE FROM table_name WHERE created_at < NOW() - INTERVAL '30 days';"
```

### Redis Issues

#### Connection Refused

```bash
# Check if Redis is running
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server

# Test connection
redis-cli ping  # Should return PONG

# Check Redis logs
sudo journalctl -u redis-server -n 50

# Monitor Redis commands
redis-cli MONITOR
```

### Memory/Performance Issues

#### High Memory Usage

```bash
# Identify memory-hungry processes
ps aux --sort=-%mem | head -10

# Check Node process memory
node --max-old-space-size=2048 script.js

# Monitor in real-time
watch -n 1 'ps aux | grep node'

# Clear cache and restart
sudo systemctl restart strelitzia-api.service
sudo systemctl restart strelitzia-web.service
```

#### Slow Queries

```bash
# Enable slow query logging (PostgreSQL)
sudo -u postgres psql strelitzia_db -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
sudo -u postgres psql -c "SELECT pg_reload_conf();"

# Check slow queries
sudo tail -f /var/log/postgresql/postgresql.log | grep duration

# Analyze slow query
EXPLAIN ANALYZE SELECT * FROM table_name WHERE ...;
```

---

## Emergency Procedures

### Service Crashes

#### Restart All Services

```bash
# Stop all services
sudo systemctl stop strelitzia-api.service
sudo systemctl stop strelitzia-web.service

# Wait 5 seconds
sleep 5

# Start all services
sudo systemctl start strelitzia-api.service
sudo systemctl start strelitzia-web.service

# Verify
sudo systemctl status strelitzia-api.service
sudo systemctl status strelitzia-web.service
```

#### Restore from Backup

```bash
# Stop services
sudo systemctl stop strelitzia-api.service
sudo systemctl stop strelitzia-web.service

# Stop PostgreSQL
sudo systemctl stop postgresql

# Find backup
ls -la /var/backups/strelitzia/

# Restore from backup
sudo -u postgres psql strelitzia_db < /var/backups/strelitzia/strelitzia_backup_20240101.sql

# Restart services
sudo systemctl start postgresql
sudo systemctl start strelitzia-api.service
sudo systemctl start strelitzia-web.service
```

### Database Corruption

```bash
# Check database integrity
sudo -u postgres pg_dump strelitzia_db > /tmp/dump.sql 2>&1

# If successful, dump is good
# If errors appear, database may be corrupted

# Try to repair
sudo -u postgres reindex DATABASE strelitzia_db

# Full database recovery
sudo systemctl stop strelitzia-api.service
sudo systemctl stop postgresql
sudo pg_resetwal /var/lib/postgresql/15/main  # Dangerous! Use only in emergency
sudo systemctl start postgresql
sudo systemctl start strelitzia-api.service
```

### Disk Space Emergency

```bash
# Check disk usage
df -h

# Clean old logs
sudo journalctl --vacuum=7d

# Clean temp files
sudo rm -rf /tmp/*

# Clean old backups (if needed)
sudo rm -f /var/backups/strelitzia/strelitzia_backup_*.sql

# Identify largest directories
du -sh /path/to/strelitzia-server/anime/*

# Clear npm cache
npm cache clean --force

# Restart services
sudo systemctl restart strelitzia-api.service
sudo systemctl restart strelitzia-web.service
```

### Port Conflicts

```bash
# Find process using port
sudo lsof -i :4000    # API
sudo lsof -i :3000    # Web
sudo lsof -i :5432    # Database
sudo lsof -i :6379    # Redis

# Kill conflicting process
kill -9 <PID>

# Or restart service to reclaim port
sudo systemctl restart strelitzia-api.service
```

---

## Useful Commands Reference

### Service Management

```bash
# Start service
sudo systemctl start strelitzia-api.service

# Stop service
sudo systemctl stop strelitzia-api.service

# Restart service
sudo systemctl restart strelitzia-api.service

# Enable at boot
sudo systemctl enable strelitzia-api.service

# Disable at boot
sudo systemctl disable strelitzia-api.service

# View logs
sudo journalctl -u strelitzia-api.service -f
```

### Database Operations

```bash
# Connect to database
psql postgresql://user:pass@localhost:5432/strelitzia_db

# Backup
pg_dump strelitzia_db > backup.sql

# Restore
psql strelitzia_db < backup.sql

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Exit
\q
```

### Application Management

```bash
# Development mode
npm run start:dev

# Production build
npm run build

# Production start
npm start

# Check logs
tail -f ~/.pm2/logs/api-error.log

# List processes
ps aux | grep node
```

---

## Getting Help

### Check Documentation

- **Quick Start:** See VERY_IMPORTANT.md
- **Detailed Guides:** See IMPORTANT.md
- **Debian Setup:** See DEBIAN_SETUP.md
- **API Documentation:** See api/README.md
- **Frontend Documentation:** See web/README.md

### Enable Debug Mode

```bash
# API debug
DEBUG=*:* npm run start:dev

# Next.js debug
NODE_OPTIONS='--inspect' npm run dev

# Database debug
PGDEBUG=1 psql ...

# Redis debug
redis-cli DEBUG
```

### Test Connectivity

```bash
# Test API
curl -v http://localhost:4000/api/health

# Test Web
curl -v http://localhost:3000

# Test Database
nc -zv localhost 5432

# Test Redis
redis-cli ping
```

---

**Last Updated:** December 12, 2025  
**Maintainer:** Development Team  
**Support:** Refer to VERY_IMPORTANT.md for quick help
