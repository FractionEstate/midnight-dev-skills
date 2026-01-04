---
description: Create a Docker configuration for Next.js with multi-stage builds and compose
name: Create Docker Setup
agent: DevOps Engineer
tools:
  - edit/editFiles
  - execute/runInTerminal
---

# Create Docker Setup

Set up Docker containerization for a Next.js application.

## Input Variables

- **Project Type**: ${input:projectType:nextjs-standalone}
- **Package Manager**: ${input:packageManager:pnpm}
- **Include Database**: ${input:includeDb:postgresql}
- **Include Redis**: ${input:includeRedis:yes}
- **Include Nginx**: ${input:includeNginx:yes}

## Requirements

1. **File Structure**:

   ```
   .
   ├── Dockerfile
   ├── .dockerignore
   ├── docker-compose.yml          # Development
   ├── docker-compose.prod.yml     # Production
   └── nginx/
       └── nginx.conf              # (if Nginx included)
   ```

2. **Dockerfile Requirements**:
   - Multi-stage build (base, deps, builder, runner)
   - Use Alpine images for smaller size
   - Enable corepack for pnpm
   - Mount cache for faster builds
   - Non-root user in production
   - Proper EXPOSE and healthcheck
   - Build arguments for environment

3. **Build Stages**:
   - **base**: Node.js + pnpm setup
   - **deps**: Install dependencies only
   - **builder**: Build application
   - **runner**: Minimal production image

4. **.dockerignore**:
   - node_modules
   - .next (except standalone)
   - .git
   - Coverage and test files
   - Environment files

5. **docker-compose.yml (Development)**:
   - Hot reload with volumes
   - Database service
   - Redis service (if included)
   - Health checks
   - Proper depends_on conditions

6. **docker-compose.prod.yml (Production)**:
   - Built image
   - Environment from .env
   - Nginx reverse proxy (if included)
   - Restart policies
   - Resource limits
   - Health checks

7. **Nginx Configuration** (if included):
   - Reverse proxy to app
   - SSL termination setup
   - Gzip compression
   - Static file caching
   - Security headers

8. **Next.js Configuration**:
   - Enable standalone output
   - Transpile packages (for monorepo)

## Commands

```bash
# Development
docker compose up -d

# Production build
docker compose -f docker-compose.prod.yml build

# Production run
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f

# Clean up
docker compose down -v
```

## Output

Provide:

1. Complete Dockerfile with comments
2. .dockerignore file
3. docker-compose.yml for development
4. docker-compose.prod.yml for production
5. nginx.conf (if included)
6. Build and run instructions
7. Troubleshooting guide
