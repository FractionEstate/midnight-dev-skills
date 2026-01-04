---
description: Create a complete REST API with route handlers, validation, and authentication
name: Create REST API
agent: API Developer
tools:
  - edit/editFiles
  - search
---

# Create REST API

Create a complete REST API endpoint with the following specification.

## Input Variables

- **Resource Name**: ${input:resourceName:posts}
- **Prisma Model**: ${input:model:Post}
- **Include Auth**: ${input:includeAuth:yes}
- **Operations**: ${input:operations:list,get,create,update,delete}

## Requirements

1. **File Structure**:
   ```
   app/api/${resourceName}/
   ├── route.ts              # GET (list), POST (create)
   └── [id]/
       └── route.ts          # GET, PUT, DELETE by ID
   ```

2. **Validation with Zod**:
   - Create schema for request body
   - Query params schema for list endpoint
   - Path params validation
   - Proper error messages

3. **Route Handler Features**:
   - Proper HTTP status codes (200, 201, 204, 400, 401, 403, 404, 500)
   - Consistent response format
   - Error handling with try/catch
   - TypeScript types throughout

4. **List Endpoint (GET /api/${resourceName})**:
   - Pagination (page, limit)
   - Sorting (sortBy, order)
   - Search/filtering
   - Include counts in meta

5. **Single Resource (GET /api/${resourceName}/[id])**:
   - 404 handling
   - Include relations as needed

6. **Create (POST /api/${resourceName})**:
   - Body validation
   - Return 201 with created resource
   - Handle unique constraint errors

7. **Update (PUT /api/${resourceName}/[id])**:
   - Partial updates supported
   - 404 if not found
   - Return updated resource

8. **Delete (DELETE /api/${resourceName}/[id])**:
   - Return 204 No Content
   - 404 if not found

9. **Authentication** (if included):
   - Check session with getServerSession
   - Role-based access control
   - Owner-only operations where appropriate

## Output Format

Provide complete, production-ready code with:
- Proper imports
- Type definitions
- JSDoc comments for complex logic
- Example usage in comments
