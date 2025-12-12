# 🟠 IMPORTANT - Detailed Guides & Reference

> Comprehensive guides for development, maintenance, and operations

---

## 📚 TABLE OF CONTENTS

1. [Character System](#character-system)
2. [Backend Development](#backend-development)
3. [Frontend Development](#frontend-development)
4. [Database Guide](#database-guide)
5. [Deployment & DevOps](#deployment--devops)
6. [Maintenance & Operations](#maintenance--operations)
7. [Debugging Guide](#debugging-guide)
8. [Performance Optimization](#performance-optimization)
9. [Security Details](#security-details)
10. [Testing Strategy](#testing-strategy)

---

## CHARACTER SYSTEM

### Overview
- **Total Characters:** 280+ anime characters and League of Legends champions
- **Database Files:**
  - `web/data/characters.ts` - 30+ foundational characters
  - `web/data/charactersExtended.ts` - 200+ extended characters
  - `web/data/charactersMassive.ts` - 170+ massive pool
- **Utilities:** `web/utils/characterUtils.ts` (15+ functions)

### Quick Reference - Common Operations

#### Get All Characters
```typescript
import { getAllCharacters } from '@/utils/characterUtils';

const allChars = getAllCharacters();
console.log(`Total: ${allChars.length}`); // 280+
```

#### Search Characters
```typescript
const results = searchAllCharacters('ninja');
// Searches across: name, source, tags, description, archetype
// Returns: Character[]
```

#### Get Specific Character
```typescript
const character = getCharacterByIdGlobal('naruto');
if (character) {
  console.log(`${character.name} from ${character.source}`);
  console.log(`Colors:`, character.colors); // 5-color palette
  console.log(`Archetype:`, character.archetype); // hero, villain, etc
}
```

#### Find Similar Characters
```typescript
const similar = getSimilarCharacters('naruto', 5);
// Algorithm: tags (50%), source (30%), archetype (20%)
// Returns: Character[] (5 most similar)
```

#### Get Statistics
```typescript
const stats = getCharacterStatistics();
console.log(stats);
// {
//   totalCharacters: 280,
//   totalSources: 45,
//   totalArchetypes: 12,
//   charactersBySource: {...},
//   charactersByArchetype: {...}
// }
```

#### Filter by Archetype
```typescript
const heroes = filterByArchetypeGlobal('hero');
const villains = filterByArchetypeGlobal('villain');
```

#### Filter by Source
```typescript
const narutoChars = filterBySourceGlobal('Naruto');
const leagueChars = filterBySourceGlobal('League of Legends');
```

### Character Data Structure
```typescript
interface Character {
  id: string;                          // Unique identifier
  name: string;                        // Full name
  source: string;                      // Anime/Game title
  description: string;                 // Bio/description
  archetype: string;                   // hero, villain, anti-hero, etc
  colors: {                            // 5-color palette
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
  };
  wallpapers?: string[];              // Image URLs
  tags: string[];                     // Search tags (ninja, mage, etc)
}
```

### Adding New Characters
```typescript
// In web/data/characters.ts, charactersExtended.ts, or charactersMassive.ts:

const newCharacters: Character[] = [
  {
    id: 'my-character',
    name: 'Character Name',
    source: 'Anime Title',
    description: 'Brief description...',
    archetype: 'hero',
    colors: {
      primary: '#FF0000',
      secondary: '#00FF00',
      accent: '#0000FF',
      dark: '#333333',
      light: '#FFFFFF'
    },
    wallpapers: ['url1', 'url2'],
    tags: ['tag1', 'tag2', 'tag3']
  }
];
```

---

## BACKEND DEVELOPMENT

### Module Structure
Each module in `api/src/modules/` contains:
```
feature/
├── feature.controller.ts    # HTTP endpoints
├── feature.service.ts       # Business logic
├── feature.module.ts        # NestJS module definition
├── entities/               # Database entities
├── dto/                    # Data Transfer Objects
└── feature.repository.ts   # Database queries (optional)
```

### Creating a New Module
```bash
# Generate module
nest g mo modules/newfeature

# Generate service
nest g s modules/newfeature

# Generate controller
nest g co modules/newfeature

# Add to app.module.ts imports
```

### API Endpoints Pattern
```typescript
// features.controller.ts
import { Controller, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  async findAll() {
    return this.featuresService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featuresService.create(createFeatureDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateFeatureDto) {
    return this.featuresService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.featuresService.remove(id);
  }
}
```

### Authentication Guards
```typescript
// Protect routes with authentication
@UseGuards(JwtAuthGuard)  // Requires valid JWT token

// Protect routes with admin role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')

// Main admin only (super user)
@UseGuards(MainAdminGuard)
```

### Database Operations
```typescript
// features.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../libs/prisma.service';

@Injectable()
export class FeaturesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feature.findMany();
  }

  async findById(id: string) {
    return this.prisma.feature.findUnique({ where: { id } });
  }

  async create(data: CreateFeatureDto) {
    return this.prisma.feature.create({ data });
  }

  async update(id: string, data: UpdateFeatureDto) {
    return this.prisma.feature.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.feature.delete({ where: { id } });
  }
}
```

---

## FRONTEND DEVELOPMENT

### Page Structure
Each page in `web/pages/`:
```typescript
import type { NextPage } from 'next';
import { withAuth } from '../hooks/withAuth';

const PageName: NextPage = () => {
  return <div>Page content</div>;
};

// Protect page (optional)
export default withAuth(PageName);
// Or for admin only:
// export default withAdminAuth(PageName);
```

### Component Template
```typescript
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<ComponentProps> = ({ title, onClick }) => {
  const { theme } = useTheme();

  return (
    <div style={{ backgroundColor: theme.colors.primary }}>
      <h1>{title}</h1>
      {onClick && <button onClick={onClick}>Click me</button>}
    </div>
  );
};
```

### Using Context
```typescript
// Theme colors
import { useTheme } from '@/contexts/ThemeContext';

export const MyComponent = () => {
  const { theme, changeTheme } = useTheme();
  
  return (
    <div style={{ backgroundColor: theme.colors.primary }}>
      <button onClick={() => changeTheme('leblancDark')}>
        Change to Le Blanc
      </button>
    </div>
  );
};
```

### Toast Notifications
```typescript
import { useToast } from '@/contexts/ToastContext';

export const MyComponent = () => {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('Operation successful!', 'success');
  };

  const handleError = () => {
    addToast('Something went wrong', 'error');
  };

  return (
    <>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </>
  );
};
```

### Authentication Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

export const ProfileComponent = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Form Validation
```typescript
interface FormData {
  email: string;
  password: string;
}

const validateForm = (data: FormData): string[] => {
  const errors: string[] = [];
  
  if (!data.email.includes('@')) {
    errors.push('Invalid email');
  }
  
  if (data.password.length < 8) {
    errors.push('Password must be 8+ characters');
  }
  
  return errors;
};
```

---

## DATABASE GUIDE

### Schema Overview
Main tables in `prisma/schema.prisma`:
- **User** - User accounts with roles
- **Video** - Video content
- **Upload** - File uploads with status tracking
- **AuditLog** - Activity logging for compliance
- **Transcoding** - Video processing queue

### Adding a New Table
```prisma
model NewEntity {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
}
```

### Running Migrations
```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: destroys data)
npx prisma db push --force-reset

# View database GUI
npx prisma studio
```

### Query Examples
```typescript
// Find with relations
const user = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: { videos: true, uploads: true }
});

// Pagination
const page = 1;
const pageSize = 20;
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize
});

// Filter
const uploads = await prisma.upload.findMany({
  where: {
    status: 'PENDING',
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }
});

// Aggregate
const stats = await prisma.video.aggregate({
  _count: true,
  _avg: { duration: true }
});
```

---

## DEPLOYMENT & DEVOPS (Debian Trixie)

### Prerequisites on Debian
```bash
# Update package list
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Redis
sudo apt-get install -y redis-server

# Install Docker & Docker Compose
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER  # Run Docker without sudo

# Install FFmpeg (for video transcoding)
sudo apt-get install -y ffmpeg

# Verify installations
node --version
psql --version
redis-server --version
docker --version
ffmpeg -version
```

### Local Development Setup (Debian)
```bash
# 1. Clone repository
cd ~/projects
git clone <your-repo>
cd anime

# 2. Install dependencies
cd api && npm install
cd ../web && npm install
cd ../transcoder && npm install

# 3. Start services (if not using Docker)
# PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 4. Setup environment
cp api/.env.example api/.env.local
cp web/.env.example web/.env.local

# 5. Create database
sudo -u postgres createdb animestream

# 6. Run migrations
cd api
npx prisma migrate deploy

# 7. Start dev servers
# Terminal 1: Backend
cd api && npm run start:dev

# Terminal 2: Frontend
cd web && npm run dev

# Terminal 3 (optional): Transcoder worker
cd transcoder && npm run start
```

### Docker Deployment (Debian)
```bash
# 1. Setup environment
cd anime
cp api/.env.example api/.env
cp web/.env.example web/.env
nano api/.env      # Edit for production
nano web/.env

# 2. Build and start
docker-compose up -d

# 3. Setup database (first time only)
docker-compose exec api npx prisma migrate deploy

# 4. Monitor
docker-compose logs -f api
docker-compose logs -f web

# 5. Manage services
docker-compose ps          # List services
docker-compose restart api # Restart API
docker-compose stop        # Stop all
docker-compose down        # Stop and remove
```

### Production Deployment (Debian)
```bash
# 1. Update system
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install dependencies
sudo apt-get install -y nodejs postgresql redis-server docker.io ffmpeg

# 3. Clone and setup
cd /opt/animestream
git clone <repo>
cd anime

# 4. Create non-root user
sudo useradd -m -s /bin/bash animestream
sudo chown -R animestream:animestream /opt/animestream

# 5. Setup environment (as animestream user)
sudo -u animestream cp api/.env.example api/.env
sudo -u animestream cp web/.env.example web/.env

# 6. Edit configuration
sudo nano api/.env           # Set production values
sudo nano web/.env
sudo nano docker-compose.yml # Adjust ports/volumes

# 7. Setup SSL (optional but recommended)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com

# 8. Start with Docker
cd /opt/animestream/anime
sudo -u animestream docker-compose up -d

# 9. Setup systemd service for auto-start
sudo cat > /etc/systemd/system/animestream.service << EOF
[Unit]
Description=AnimeStream Docker Compose
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=animestream
WorkingDirectory=/opt/animestream/anime
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable animestream.service
sudo systemctl start animestream.service
```

### Environment Variables (Debian)
```bash
# Create /etc/environment.d/animestream.conf
DATABASE_URL="postgresql://postgres:secure_password@localhost:5432/animestream"
JWT_SECRET="$(openssl rand -base64 32)"
REDIS_URL="redis://localhost:6379"
FFMPEG_PATH="/usr/bin/ffmpeg"
NODE_ENV="production"
API_URL="https://yourdomain.com"
WEB_URL="https://yourdomain.com"
```

### Monitoring (Debian)
```bash
# Check service status
sudo systemctl status postgresql
sudo systemctl status redis-server
docker-compose ps

# View logs
sudo journalctl -u postgresql -f
sudo journalctl -u redis-server -f
docker-compose logs -f

# Monitor system resources
top
free -h
df -h
```

---

## MAINTENANCE & OPERATIONS (Debian Trixie)

### Daily Tasks
```bash
# Monitor system
free -h && df -h && top -bn1 | head -20

# Check service status
sudo systemctl status postgresql
sudo systemctl status redis-server

# Check logs for errors
sudo journalctl -u postgresql -n 50 | grep ERROR
sudo journalctl -u redis-server -n 50 | grep ERROR
docker-compose logs api | grep ERROR

# Verify backups running
ls -lh /var/backups/animestream/

# Monitor disk space
df -h | grep -E "/$|/var"
```

### Weekly Tasks
```bash
# Review security advisories
npm audit

# Update dependencies
npm outdated
npm update

# Database maintenance
sudo -u postgres vacuumdb animestream
sudo -u postgres analyzedb animestream

# User feedback review
# Check admin dashboard for reports

# Backup database
sudo -u postgres pg_dump animestream > /var/backups/animestream/backup-$(date +%Y%m%d).sql

# Compress backup
gzip /var/backups/animestream/backup-*.sql
```

### Monthly Tasks
```bash
# Full security audit
npm audit
docker image ls | grep -E "api|web"

# Performance profiling
# Check slow queries in PostgreSQL
sudo -u postgres psql animestream -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10"

# Database backup test
sudo -u postgres pg_restore -l /var/backups/animestream/backup-latest.sql | head

# Dependency updates with testing
npm update --save
npm run test
npm run build

# Documentation review and update
# Update IMPORTANT.md, VERY_IMPORTANT.md as needed
```

### Quarterly Tasks
```bash
# Architecture review
# Plan scaling if needed

# Capacity planning
# Check storage, CPU, memory usage trends
df -h /var/lib/postgresql
free -h

# Security audit
# Update OS: sudo apt-get update && sudo apt-get upgrade -y
# Check expired certificates: openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
# Review user access logs

# Disaster recovery drill
# Test restore from backup
# Test failover procedures

# Team training
# Update internal docs
# Conduct architecture walkthroughs
```

### Backup Procedure (Debian)
```bash
#!/bin/bash
# /usr/local/bin/backup-animestream.sh

BACKUP_DIR="/var/backups/animestream"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
sudo -u postgres pg_dump -F c animestream > $BACKUP_DIR/animestream_$BACKUP_DATE.dump

# Backup application files (if needed)
tar -czf $BACKUP_DIR/animestream_files_$BACKUP_DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  /opt/animestream/anime

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$BACKUP_DATE.tar.gz /opt/animestream/anime/uploads

# Upload to S3 (if available)
# aws s3 cp $BACKUP_DIR/*.dump s3://your-bucket/backups/
# aws s3 cp $BACKUP_DIR/*.tar.gz s3://your-bucket/backups/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed at $BACKUP_DATE"
```

### Automated Cron Jobs (Debian)
```bash
# Edit crontab
sudo crontab -e

# Add these lines:

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-animestream.sh

# Weekly security updates (Sunday 3 AM)
0 3 * * 0 sudo apt-get update && apt-get upgrade -y

# Weekly npm audit (Friday 4 AM)
0 4 * * 5 cd /opt/animestream/anime && npm audit --audit-level=moderate

# Daily log rotation
0 0 * * * docker exec postgres_container vacuumdb -Z animestream

# Restart services if down (every 5 minutes)
*/5 * * * * systemctl is-active --quiet postgresql || systemctl restart postgresql
*/5 * * * * systemctl is-active --quiet redis-server || systemctl restart redis-server
```

### Performance Tuning (PostgreSQL on Debian)
```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/15/main/postgresql.conf

# Recommended settings for 8GB RAM:
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Reload config
sudo systemctl reload postgresql

# Check current stats
sudo -u postgres psql animestream -c "SELECT * FROM pg_stat_database WHERE datname='animestream';"
```

---

## DEBUGGING GUIDE (Debian Trixie)

### Backend Issues

#### 500 Internal Server Error
```bash
# 1. Check Node.js error logs
tail -f /var/log/animestream/api.log

# 2. Check database connection
psql -h localhost -U postgres -d animestream -c "SELECT 1"

# 3. Check Redis connection
redis-cli ping

# 4. View API process logs
pm2 logs api   # If using PM2
docker-compose logs api  # If using Docker

# 5. Check system resources
free -h
df -h
```

#### Database Connection Failed
```bash
# 1. Check PostgreSQL status
sudo systemctl status postgresql

# 2. Test connection string
psql "postgresql://postgres:password@localhost:5432/animestream"

# 3. Check PostgreSQL is listening
sudo netstat -tuln | grep 5432

# 4. Restart PostgreSQL
sudo systemctl restart postgresql

# 5. Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# 6. Create database if missing
sudo -u postgres createdb animestream

# 7. Run migrations
npx prisma migrate deploy
```

#### Authentication Not Working
```bash
# 1. Check JWT_SECRET is set
env | grep JWT_SECRET

# 2. Verify token in database
psql -d animestream -c "SELECT id, email, role FROM users LIMIT 5"

# 3. Check password hashing
npm install -g jwt-decode
jwt-decode <your-token>

# 4. Verify guard middleware
grep -r "JwtAuthGuard" api/src/modules/
```

#### Port Already in Use
```bash
# 1. Find process on port
sudo lsof -i :3001

# 2. Kill process
sudo kill -9 <PID>

# 3. Or use different port
PORT=3002 npm run start:dev
```

### Frontend Issues

#### Components Not Rendering
```bash
# 1. Check build errors
npm run build

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Check browser console (F12)
# Look for JavaScript errors

# 5. Verify context providers in _app.tsx
grep -n "Provider" pages/_app.tsx
```

#### API Calls Failing
```bash
# 1. Check API_URL is set correctly
env | grep API_URL

# 2. Verify API is running
curl http://localhost:3001/api/health

# 3. Check CORS settings
# In api/src/main.ts

# 4. Monitor network requests (in browser DevTools)
# Network tab -> check request/response

# 5. Check for HTTPS redirects in production
curl -I https://api.yourdomain.com
```

#### Styling Issues
```bash
# 1. Clear Tailwind cache
rm -rf .next && npm run build

# 2. Verify theme context
grep -r "ThemeProvider" pages/

# 3. Check CSS variables in browser
# DevTools -> Inspector -> :root

# 4. Rebuild styles
npm run build

# 5. Check for missing CSS files
ls -la styles/
```

### Common Errors & Solutions

| Error | Solution |
|-------|----------|
| `Cannot GET /` | Missing index.tsx page (now created) |
| `Module not found` | Check import path (case-sensitive on Linux!) |
| `EADDRINUSE: Address already in use :::3000` | Kill process: `sudo fuser -k 3000/tcp` |
| `Connection refused` | PostgreSQL/Redis not running: `sudo systemctl start postgresql redis-server` |
| `ENOENT: no such file or directory, open '.env'` | Copy .env.example: `cp api/.env.example api/.env` |
| `EACCES: permission denied` | Fix permissions: `sudo chown -R $USER:$USER .` |
| `Prisma Engine error` | Run: `npx prisma generate && npx prisma migrate deploy` |
| `Token expired` | JWT_EXPIRATION too short, or token not refreshing |

### System Debugging (Debian)
```bash
# View all system logs
sudo journalctl -xe

# Monitor processes
top -u postgres
top -u redis

# Check disk usage
df -h /var/lib/postgresql
du -sh /var/lib/postgresql/*

# Check memory usage
free -h
cat /proc/meminfo

# Network connectivity
ping 8.8.8.8
netstat -tuln | grep LISTEN
ss -tuln | grep 5432
```

---

## PERFORMANCE OPTIMIZATION

### Frontend Optimization
```typescript
// Memoization (prevent unnecessary re-renders)
import { useMemo, useCallback } from 'react';

const MyComponent = ({ items }) => {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const handleClick = useCallback(() => {
    // Logic here
  }, []);

  return <div>{sortedItems.map(item => ...)}</div>;
};
```

### Backend Optimization
```typescript
// Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
  where: { role: 'admin' }
});

// Use pagination
const page = 1;
const pageSize = 20;
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize
});

// Add indexes for frequently queried fields
```

### Caching Strategy
```typescript
// Use Redis for expensive operations
const cacheKey = `characters:all`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await getCharactersFromDB();
await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour

return data;
```

---

## SECURITY DETAILS

### Secrets Management
```bash
# NEVER commit .env
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Use environment variables only
process.env.JWT_SECRET  // Backend
process.env.NEXT_PUBLIC_API_URL  // Frontend (public safe info only)
```

### Input Validation
```typescript
// Backend DTOs
import { IsEmail, MinLength, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// Frontend validation
const email = input.trim().toLowerCase();
if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  throw new Error('Invalid email');
}
```

### SQL Injection Prevention
```typescript
// ✅ SAFE - Prisma parameterizes queries
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ❌ UNSAFE - Direct SQL (never do this)
const user = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### Password Security
```typescript
// Hashing
import * as bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## TESTING STRATEGY

### Unit Tests
```typescript
// characterUtils.test.ts
describe('characterUtils', () => {
  describe('searchAllCharacters', () => {
    it('should find characters by name', () => {
      const results = searchAllCharacters('naruto');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Naruto');
    });

    it('should handle empty search', () => {
      const results = searchAllCharacters('');
      expect(results.length).toEqual(getAllCharacters().length);
    });
  });
});
```

### Integration Tests
```typescript
// auth.controller.spec.ts
describe('AuthController', () => {
  it('should login user with correct credentials', async () => {
    const result = await authService.login(validEmail, validPassword);
    expect(result).toHaveProperty('access_token');
    expect(result.access_token).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// pages.e2e.ts
describe('Pages', () => {
  it('should load homepage', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    const title = await page.title();
    expect(title).toContain('AnimeStream');
  });
});
```

### Running Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm run test -- characterUtils.test.ts
```

---

## LEARNING RESOURCES

### Official Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Getting Help
1. Check error messages carefully
2. Search existing issues on GitHub
3. Check DEBUGGING_GUIDE section above
4. Ask team lead or mentor

---

**Last Updated:** December 11, 2025  
**Version:** 1.0
