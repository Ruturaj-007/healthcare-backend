# Security Checklist

## Implemented

| Control | Implementation |
|---|---|
| Password storage | bcrypt, 12 salt rounds — irreversible, salted, resistant to rainbow tables |
| Authentication | JWT access (15 min) + refresh (7 day) tokens, separate signing secrets |
| Authorization | Role-based middleware (RBAC) enforced at route level, independent of business logic |
| Input validation | Zod schemas on all mutable endpoints, reject before reaching business logic |
| Transport headers | Helmet — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc. |
| CORS | Enabled, currently permissive for development; scoped to known origins before production |
| Secrets management | All secrets via environment variables, `.env` gitignored, never committed |
| Error handling | Global error middleware masks internal errors/stack traces in production responses |
| Account enumeration | Login returns identical generic message for "user not found" and "wrong password" |
| SQL injection | Mitigated structurally — Prisma uses parameterized queries exclusively, no raw SQL/string concatenation anywhere in the codebase |
| Idempotency | Unique `idempotencyKey` constraint prevents duplicate writes from retries |
| Race conditions | Transactional conditional updates prevent double-booking under concurrent requests |

## Not Implemented (documented gap, not silent omission)

| Control | Status / Planned Approach |
|---|---|
| Rate limiting | Not implemented. Planned: `express-rate-limit` per-IP on auth endpoints (prevent credential stuffing/brute force), stricter limits on `/auth/login` specifically |
| MFA | Not implemented. Planned: TOTP-based (e.g. `speakeasy`) as an opt-in second factor, enforced for `DOCTOR`/`ADMIN` roles at minimum given data sensitivity |
| Audit logging | Not implemented as a dedicated table. Planned: `audit_logs` table capturing actor, action, resource, timestamp for all writes to consultation/prescription data, per healthcare compliance norms |
| Encryption at rest | Relies on Neon's default provider-level encryption; field-level encryption for PII (e.g. medical notes) not separately implemented |
| Key rotation | Not implemented. JWT secrets are static; planned: versioned secrets with rotation window supporting graceful token invalidation |
| Dependency scanning | Not automated. `npm audit` run manually; planned: GitHub Dependabot / `npm audit` as a CI step |
| CSRF | Not applicable in current form — API is token-based (JWT via header, not cookies), which structurally avoids CSRF; would need explicit handling if cookie-based sessions are introduced later |

## OWASP Top 10 — Mapping

- **A01 Broken Access Control** → RBAC middleware, ownership checks in service layer (e.g. doctor can only manage their own profile/availability)
- **A02 Cryptographic Failures** → bcrypt for passwords, JWT signed (not encrypted) with least-privilege payload (no sensitive data in token claims)
- **A03 Injection** → Prisma ORM, no raw SQL, no string-concatenated queries
- **A04 Insecure Design** → idempotency + transactional concurrency control designed in from the schema level, not bolted on
- **A05 Security Misconfiguration** → Helmet defaults, environment-based config, no secrets in source
- **A07 Identification & Authentication Failures** → bcrypt, JWT expiry, generic auth error messages
- **A09 Security Logging Failures** → structured logging present (Pino); dedicated audit trail not yet implemented (see gap above)