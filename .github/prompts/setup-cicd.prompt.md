---
description: Set up complete CI/CD pipeline with GitHub Actions, testing, and deployment
name: Setup CI/CD Pipeline
agent: DevOps Engineer
tools:
  - edit/editFiles
  - execute/runInTerminal
---

# Setup CI/CD Pipeline

Configure a complete CI/CD pipeline with GitHub Actions.

## Input Variables

- **Project Type**: ${input:projectType:turborepo} (turborepo, nextjs, node)
- **Deploy Target**: ${input:deployTarget:vercel} (vercel, docker, aws)
- **Include Tests**: ${input:includeTests:yes}
- **Include Preview Deploys**: ${input:previewDeploys:yes}

## Requirements

1. **Workflow Files**:

   ```text
   .github/workflows/
   ├── ci.yml              # Lint, typecheck, test, build
   ├── deploy.yml          # Production deployment
   └── preview.yml         # Preview deployments (optional)
   ```

2. **CI Workflow (ci.yml)**:
   - Trigger on push to main/develop and PRs
   - Concurrency control (cancel in-progress)
   - Jobs: lint, typecheck, test, build
   - Parallel execution where possible
   - Caching for pnpm/npm and build outputs
   - Turborepo remote caching (if applicable)

3. **Test Job Features**:
   - PostgreSQL service container
   - Run database migrations
   - Code coverage collection
   - Upload to Codecov

4. **Build Job Features**:
   - Depends on passing tests
   - Upload build artifacts
   - Bundle size reporting

5. **Deploy Workflow (deploy.yml)**:
   - Trigger on main branch push
   - Manual trigger option
   - Environment protection
   - Deploy URL output
   - Slack/Discord notification (optional)

6. **Preview Workflow** (if included):
   - Trigger on PRs
   - Unique preview URL per PR
   - Comment preview URL on PR
   - Cleanup on PR close

7. **Required Secrets**:
   - Document all required secrets
   - Provide setup instructions
   - Include example values format

## Environment Variables

```yaml
# Required in GitHub Secrets
VERCEL_TOKEN: '...' # For Vercel deployments
TURBO_TOKEN: '...' # For remote caching
DATABASE_URL: '...' # For test database
CODECOV_TOKEN: '...' # For coverage

# Required in GitHub Variables
TURBO_TEAM: '...'
```

## Output

Provide:

1. Complete workflow YAML files
2. Secrets setup guide
3. Branch protection recommendations
4. Troubleshooting tips
