---
description: Configure authentication with NextAuth.js v5 including OAuth providers and credentials
name: Setup Authentication
agent: API Developer
tools:
  - edit/editFiles
  - execute/runInTerminal
---

# Setup Authentication

Configure complete authentication with NextAuth.js v5 (Auth.js).

## Input Variables

- **Providers**: ${input:providers:github,google,credentials}
- **Session Strategy**: ${input:sessionStrategy:jwt}
- **Include Role-Based Access**: ${input:rbac:yes}
- **Database Adapter**: ${input:adapter:prisma}

## Requirements

1. **File Structure**:
   ```
   lib/
   └── auth.ts                    # Auth configuration
   app/
   ├── api/auth/[...nextauth]/
   │   └── route.ts               # Auth route handler
   ├── (auth)/
   │   ├── login/page.tsx         # Login page
   │   └── register/page.tsx      # Register page
   └── middleware.ts              # Auth middleware
   types/
   └── next-auth.d.ts             # Type augmentation
   ```

2. **Auth Configuration (lib/auth.ts)**:
   - Export `auth`, `signIn`, `signOut`, `handlers`
   - Configure all providers
   - Set up callbacks (jwt, session, authorized)
   - Custom pages configuration
   - Session strategy

3. **OAuth Providers**:
   - GitHub OAuth
   - Google OAuth
   - Custom provider setup guide

4. **Credentials Provider** (if included):
   - Email/password validation
   - bcrypt password hashing
   - Error handling for invalid credentials

5. **Database Adapter**:
   - Prisma adapter configuration
   - Required Prisma models (User, Account, Session, VerificationToken)

6. **JWT Callbacks**:
   - Add user ID to token
   - Add role to token
   - Pass data to session

7. **Middleware**:
   - Protect routes with matcher
   - Role-based route protection
   - Redirect logic for auth pages

8. **Type Augmentation**:
   - Extend User type with role
   - Extend Session type
   - Extend JWT type

9. **Role-Based Access** (if included):
   - Admin routes protection
   - Permission checking utilities
   - Role enum in Prisma

## Environment Variables

```bash
# Required
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OAuth Providers
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
```

## Output

Provide:
1. Complete auth.ts configuration
2. Route handler
3. Middleware configuration
4. Type definitions
5. Login/Register components
6. useSession hook examples
7. Server-side session access patterns
