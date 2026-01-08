# Example: Task Plan After Review

This is the improved version of the task plan after applying review-plan recommendations.

## Rationale

We need to implement JWT-based authentication to support secure user sessions across multiple devices. This change uses JWT in-memory storage with HTTP-only refresh tokens to balance security (XSS protection) with user experience (persistent login).

**Alternatives considered:**
1. JWT in localStorage - rejected due to XSS vulnerability
2. HTTP-only cookies only - rejected due to CORS complexity with mobile clients
3. JWT in memory + refresh token in HTTP-only cookie ✅ - chosen for security + UX balance

**Assumptions:**
- Using Express.js framework (existing in src/app.ts)
- Redis available for session storage (see project.md infrastructure section)
- Following existing auth patterns from openspec/specs/authentication/spec.md

## Tasks

### Phase 1: Authentication Foundation (Tasks 1-3, no dependencies, can parallelize)

1. **Add JWT validation middleware to Express app**
   - File: `src/middleware/auth.ts`
   - Create middleware that validates JWT tokens from Authorization header
   - Extract userId from token payload and attach to req.user
   - Validation: `npm test -- src/middleware/auth.test.ts`
   - Success: Middleware rejects requests with invalid/missing tokens (401), accepts valid tokens

2. **Create user session store with Redis**
   - File: `src/services/session.ts`
   - Implement SessionStore class with create/get/delete/refresh methods
   - Use Redis keys: `session:{userId}:{deviceId}` with 7-day TTL
   - Validation: `npm test -- src/services/session.test.ts`
   - Success: Sessions persist across server restarts, auto-expire after TTL

3. **Add login endpoint**
   - File: `src/routes/auth.ts`
   - POST /auth/login accepts {email, password}
   - Returns {accessToken, refreshToken} on valid credentials
   - Validation: `curl -X POST localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'`
   - Success: Returns 200 with tokens for valid credentials, 401 for invalid

### Phase 2: User Profile Support (Tasks 4-5, requires Task 2 complete)

4. **Add user profile schema to User model**
   - File: `src/models/user.ts`
   - Add optional fields: firstName, lastName, avatarUrl, lastLoginAt
   - Update TypeScript interfaces and Joi validation schemas
   - Validation: `npm run typecheck && npm run lint`
   - Success: TypeScript compiles without errors, no lint warnings

5. **Create GET /profile endpoint**
   - File: `src/routes/profile.ts`
   - GET /profile requires auth middleware (from Task 1)
   - Returns user profile: {id, email, firstName, lastName, avatarUrl}
   - Updates lastLoginAt field using session from Task 2
   - Validation: `npm test -- src/routes/profile.test.ts && curl -H "Authorization: Bearer <token>" localhost:3000/profile`
   - Success: Returns 200 with profile for authenticated users, 401 for unauthenticated

### Phase 3: Bug Fixes (Task 6, no dependencies, can parallelize with Phase 2)

6. **Fix token refresh race condition**
   - File: `src/middleware/auth.ts` (line 45-67, refresh logic)
   - Problem: Concurrent requests trigger duplicate token refreshes
   - Solution: Add mutex lock using async-mutex library around refresh logic
   - Validation: `npm test -- src/middleware/auth-concurrency.test.ts` (new test with 50 concurrent requests)
   - Success: Test passes with 0 duplicate refreshes across 50 concurrent requests

### Phase 4: Documentation (Task 7, requires all above tasks complete)

7. **Update API documentation**
   - File: `docs/api/authentication.md`
   - Document POST /auth/login, POST /auth/refresh, GET /profile endpoints
   - Include curl examples, request/response schemas, error codes
   - Add authentication flow diagram (JWT lifecycle)
   - Validation: Manual review + `npm run docs:validate`
   - Success: All endpoints have complete examples, schemas match implementation (checked by docs validator)

## Risk Assessment

- **Risk:** Token refresh race condition (Task 6)
  - Likelihood: High under load
  - Impact: Users see duplicate refresh errors
  - Mitigation: Addressed in Task 6 with mutex lock + concurrency test

- **Risk:** Redis connection failure breaks all auth
  - Likelihood: Low (infrastructure stable)
  - Impact: Critical (all users blocked)
  - Mitigation: Add Redis connection retry logic with exponential backoff (out of scope, filed as follow-up)

## Validation Checkpoints

- **After Phase 1:** Run full test suite (`npm test`), verify all auth tests pass
- **After Phase 2:** Manual smoke test login flow + profile retrieval
- **After Phase 3:** Load test with 1000 concurrent requests, monitor for errors
- **After Phase 4:** Product review of docs, confirm all examples work

## Related Work

- See: `openspec/specs/authentication/spec.md` for existing auth requirements
- Related change: `add-user-roles` (uses same auth middleware pattern)
- Reference: Express.js middleware best practices (https://expressjs.com/en/guide/using-middleware.html)
