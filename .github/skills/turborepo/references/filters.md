# Turborepo Filter Patterns Reference

Turborepo's `--filter` flag controls which packages to include in a command.

## Basic Syntax

```bash
# Run in specific package
turbo build --filter=web

# Run in multiple packages
turbo build --filter=web --filter=api

# Glob pattern
turbo build --filter="@myorg/*"

# All packages
turbo build --filter="*"
```

## Dependency Filters

```bash
# Package and its dependencies (upstream)
turbo build --filter=web...

# Package and its dependents (downstream)
turbo build --filter=...web

# Dependencies only (exclude package itself)
turbo build --filter=web^...

# Dependents only (exclude package itself)
turbo build --filter=...^web
```

## Directory Filters

```bash
# Packages in specific directory
turbo build --filter="./apps/*"

# Packages in apps directory
turbo build --filter="{./apps/*}"

# Exclude packages
turbo build --filter="!./apps/admin"
```

## Git-Based Filters

```bash
# Changed since main branch
turbo build --filter="[main]"

# Changed since specific commit
turbo build --filter="[abc1234]"

# Changed in HEAD commit
turbo build --filter="[HEAD^1]"

# Changed packages and their dependents
turbo build --filter="...[main]"

# Changed packages and their dependencies
turbo build --filter="[main]..."
```

## Combining Filters

```bash
# Web package and dependencies, but only changed ones
turbo build --filter=web... --filter="[main]"

# All packages except docs
turbo build --filter="*" --filter="!docs"

# Changed packages in apps directory
turbo build --filter="./apps/*[main]"
```

## Practical Examples

### CI: Only affected packages

```yaml
# .github/workflows/ci.yml
- name: Build affected packages
  run: pnpm turbo build --filter="...[origin/main]"
```

### Development: Single app with deps

```bash
# Start web app and all its dependencies
turbo dev --filter=web...
```

### Deploy: Production apps only

```bash
# Build only production apps
turbo build --filter="./apps/web" --filter="./apps/api"
```

### Testing: Changed packages

```bash
# Test only what changed
turbo test --filter="[HEAD^1]..."
```

## Filter in turbo.json

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    },
    "deploy": {
      "dependsOn": ["build"],
      "filter": ["./apps/*"]
    }
  }
}
```

## Package Selection Logic

| Filter | Selects |
| ------ | ------- |
| `web` | Package named "web" |
| `web...` | web + its dependencies |
| `...web` | web + its dependents |
| `web^...` | Only web's dependencies |
| `...^web` | Only web's dependents |
| `[main]` | Changed since main |
| `...[main]` | Changed + their dependents |
| `[main]...` | Changed + their dependencies |

## Common Workflows

```bash
# Full CI build
turbo build lint test typecheck

# Fast PR check (only affected)
turbo build lint test --filter="...[origin/main]"

# Local dev with hot reload
turbo dev --filter=web...

# Release build
turbo build --filter="./apps/*" --filter="./packages/*"

# Specific package deep clean
turbo clean --filter=web...
```
