---
description: Initialize a new Turborepo monorepo with Next.js, shared packages, and CI/CD
name: Create Turborepo Monorepo
agent: Fullstack Developer
tools:
  - edit/editFiles
  - execute/runInTerminal
  - vscode/newWorkspace
---

# Create Turborepo Monorepo

Set up a new Turborepo monorepo with the following configuration.

## Input Variables

- **Project Name**: ${input:projectName:my-turborepo}
- **Apps to Include**: ${input:apps:web,docs} (comma-separated)
- **Shared Packages**: ${input:packages:ui,database,config-typescript,config-eslint}
- **Include CI/CD**: ${input:includeCi:yes}

## Requirements

1. **Directory Structure**:

   ```text
   ${projectName}/
   ├── apps/
   │   └── [each app]/
   ├── packages/
   │   └── [each package]/
   ├── turbo.json
   ├── package.json
   └── pnpm-workspace.yaml
   ```

2. **turbo.json Configuration**:
   - Build task with proper dependencies (^build)
   - Dev task (no cache, persistent)
   - Lint, test, typecheck tasks
   - Database tasks if database package included
   - Remote caching configuration

3. **Root package.json**:
   - Use pnpm as package manager
   - Include turbo scripts for all tasks
   - Latest stable versions

4. **Apps Setup**:
   - Next.js 15+ with App Router for web apps
   - TypeScript strict mode
   - Import shared packages

5. **Shared Packages**:
   - `@repo/ui`: Shared React components
   - `@repo/database`: Prisma schema and client
   - `@repo/config-typescript`: Shared tsconfig
   - `@repo/config-eslint`: Shared ESLint config

6. **CI/CD** (if included):
   - GitHub Actions workflow for lint, test, build
   - Caching for pnpm and Turborepo
   - Vercel deployment workflow

## Output

After creation, provide:

1. Project structure overview
2. Available npm scripts
3. Next steps for development
4. How to add new apps/packages
