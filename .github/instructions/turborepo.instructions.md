---
description: Turborepo monorepo development guidelines
name: Turborepo Development
applyTo: '**/turbo.json,**/pnpm-workspace.yaml'
---

# Turborepo Instructions

## Project Structure

```text
monorepo/
├── apps/           # Deployable applications
│   ├── web/        # Next.js frontend
│   └── api/        # Backend API
├── packages/       # Shared packages
│   ├── ui/         # Component library
│   ├── config/     # Shared configs
│   └── utils/      # Shared utilities
├── turbo.json      # Task configuration
└── package.json    # Root scripts
```

## turbo.json Configuration

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "stream",
  "envMode": "strict",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["DATABASE_URL", "NEXT_PUBLIC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "interactive": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

## Task Dependencies

- `^build` - Run in dependencies first (topological)
- `build` - Run in same package first
- No prefix - Run after specific task

## Caching

### Cache Outputs

```json
{
  "build": {
    "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
  }
}
```

### Environment Variables

```json
{
  "globalEnv": ["CI", "VERCEL"],
  "globalPassThroughEnv": ["GITHUB_TOKEN"],
  "tasks": {
    "build": {
      "env": ["DATABASE_URL", "NEXT_PUBLIC_*"],
      "passThroughEnv": ["AWS_SECRET"]
    }
  }
}
```

## Filtering

```bash
# Single package
turbo run build --filter=web

# Package and dependencies
turbo run build --filter=web...

# Packages depending on
turbo run build --filter=...^ui

# Changed since main branch
turbo run build --filter=[main...HEAD]

# Changed since previous commit
turbo run build --filter=[HEAD^1]

# Target specific task in package
turbo run web#lint

# Exclude package
turbo run build --filter=./apps/* --filter=!./apps/admin

# CI optimized: only affected packages
turbo run build --affected
```

## Development Mode

```bash
# Watch mode - re-runs on file changes
turbo watch build lint typecheck

# Watch specific packages
turbo watch build --filter=web
```

## Docker (turbo prune)

```bash
# Generate minimal monorepo for Docker
turbo prune web --docker
```

Creates `out/json/` (package.json files) and `out/full/` (full code) for optimal Docker layer caching.

## Workspace Dependencies

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*"
  }
}
```

## Best Practices

1. **Keep packages focused** - Single responsibility
2. **Share configs** - ESLint, TypeScript in packages/config
3. **Use workspace protocol** - `workspace:*` for internal deps
4. **Enable remote caching** - In CI for faster builds
5. **Use --affected in CI** - Only build changed packages
6. **Use turbo prune** - For optimized Docker builds
7. **Full git history** - Use `fetch-depth: 0` for --affected flag
