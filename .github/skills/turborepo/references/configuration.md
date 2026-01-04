# Turborepo Task Configuration

## Complete turbo.json Reference

```json
{
  "$schema": "https://turborepo.com/schema.json",

  "ui": "stream",
  "envMode": "strict",
  "daemon": true,
  "cacheDir": ".turbo/cache",

  "globalDependencies": [
    ".env",
    ".env.local"
  ],

  "globalEnv": [
    "CI",
    "VERCEL",
    "NODE_ENV"
  ],

  "globalPassThroughEnv": [
    "AWS_ACCESS_KEY",
    "GITHUB_TOKEN"
  ],

  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env*",
        "!.env.local"
      ],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**",
        "build/**"
      ],
      "outputLogs": "new-only",
      "env": [
        "DATABASE_URL",
        "NEXT_PUBLIC_*",
        "!GITHUB_*"
      ]
    },

    "dev": {
      "cache": false,
      "persistent": true,
      "interactive": true,
      "dependsOn": ["^build"]
    },

    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "outputLogs": "errors-only"
    },

    "lint:fix": {
      "cache": false,
      "outputs": []
    },

    "test": {
      "dependsOn": ["build"],
      "inputs": [
        "src/**",
        "test/**",
        "tests/**"
      ],
      "outputs": [
        "coverage/**"
      ],
      "env": [
        "DATABASE_URL",
        "TEST_DATABASE_URL"
      ]
    },

    "test:watch": {
      "cache": false,
      "persistent": true,
      "interactive": true
    },

    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },

    "clean": {
      "cache": false,
      "outputs": []
    },

    "db:migrate": {
      "cache": false,
      "outputs": []
    },

    "db:studio": {
      "cache": false,
      "persistent": true,
      "interruptible": true
    }
  }
}
```

## Task Properties

### dependsOn

```json
{
  "build": {
    // Run ^build (build in dependencies) first
    "dependsOn": ["^build"]
  },
  "test": {
    // Run build in same package, then test
    "dependsOn": ["build"]
  },
  "deploy": {
    // Multiple dependencies
    "dependsOn": ["build", "test", "^build"]
  },
  "e2e": {
    // Specific package task
    "dependsOn": ["web#build"]
  }
}
```

### inputs

```json
{
  "build": {
    "inputs": [
      "$TURBO_DEFAULT$",      // All non-gitignored files (restores defaults)
      ".env.production",       // Include specific file
      "!.env.local",          // Exclude file
      "!**/*.test.ts",        // Exclude pattern
      "src/**/*.{ts,tsx}",    // Glob pattern
      "$TURBO_ROOT$/tsconfig.json"  // Reference repository root
    ]
  }
}
```

#### Input Microsyntax

- `$TURBO_DEFAULT$` - Restores default inputs (all non-gitignored files)
- `$TURBO_ROOT$` - Reference files relative to repository root
- `$TURBO_EXTENDS$` - Inherit array values from extended config

```json
// packages/ui/turbo.json - extending root config
{
  "$schema": "https://turborepo.com/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": ["$TURBO_EXTENDS$", "design-tokens.json"]
    }
  }
}
```

Note: `package.json`, `turbo.json`, and lockfiles are always included in inputs automatically and cannot be ignored.

### outputs

```json
{
  "build": {
    "outputs": [
      "dist/**",
      ".next/**",
      "!.next/cache/**",      // Exclude cache
      "build/**",
      "*.tgz"                 // Pack output
    ]
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
      "env": [
        "DATABASE_URL",
        "NEXT_PUBLIC_*",        // Wildcard: all NEXT_PUBLIC_ vars
        "!GITHUB_*"             // Negation: exclude from strict mode filtering
      ],
      "passThroughEnv": ["AWS_SECRET"]   // Available but doesn't affect cache
    }
  }
}
```

#### envMode (Global)

Controls how environment variables are handled:

- `"strict"` (default) - Only explicitly listed env vars are available
- `"loose"` - All env vars from the calling process are available

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "envMode": "strict"
}
```
```

### Output Logs

```json
{
  "build": {
    "outputLogs": "full"      // Always show logs
  },
  "lint": {
    "outputLogs": "errors-only" // Only on errors
  },
  "test": {
    "outputLogs": "new-only"  // Only on cache miss
  }
}
```

## Workspace Configuration

### Package-Specific Config

```json
// packages/ui/turbo.json
{
  "$schema": "https://turborepo.com/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**", "types/**"]
    }
  }
}
```

### Root Package.json Scripts

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules .turbo"
  }
}
```

## Remote Caching

### Vercel Remote Cache

```bash
# Login
npx turbo login

# Link to Vercel project
npx turbo link

# Runs with remote caching
turbo run build
```

### Self-Hosted Cache

```bash
# Environment variables
TURBO_API="https://cache.example.com"
TURBO_TOKEN="your-token"
TURBO_TEAM="your-team"

# Or in turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

## CI Configuration

### GitHub Actions

```yaml
- name: Build
  run: pnpm turbo run build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}

# For affected packages only (requires full git history)
- name: Build Affected
  run: pnpm turbo run build --affected
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

### Source Control Filtering in CI

```yaml
# Ensure full git history for --affected and filter flags
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Required for --affected flag

# Run only affected tasks
- run: turbo run build --affected

# Or filter by source control changes
- run: turbo run build --filter=[HEAD^1]
- run: turbo run build --filter=[main...HEAD]
```
