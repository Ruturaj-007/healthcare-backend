# Amrutam Telemedicine Backend

Node.js/Express/Prisma/PostgreSQL backend for a telemedicine platform.

## Tech Stack
Node.js, Express 5, PostgreSQL (Neon), Prisma 7, JWT Auth, Zod validation, Pino logging, bcrypt

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`, fill in `DATABASE_URL` (Neon Postgres), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
3. `npx prisma migrate dev`
4. `npm run dev` — runs on port 5000

## Implemented Features
- **Auth**: Register, Login, JWT (access + refresh), bcrypt password hashing
- **RBAC**: Role-based middleware (PATIENT / DOCTOR / ADMIN)
- **Doctor Availability**: Profile creation, slot management, public search by specialization
- **Booking**: Idempotent appointment booking with transaction-based race-condition protection (double-booking is structurally impossible via atomic slot-lock)

## API Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/doctors/profile`, `POST /api/doctors/availability`, `GET /api/doctors`, `GET /api/doctors/:id/availability`
- `POST /api/appointments`, `GET /api/appointments/my`

## Known Limitations / Next Steps
Given the assignment timeline, the following were prioritized out and are documented here rather than left silent:
- Consultation lifecycle and Prescriptions: schema is fully modeled (see `prisma/schema.prisma`) and directly extends the Booking service pattern already implemented; not yet wired to endpoints.
- Rate limiting, MFA, audit logs, admin analytics: not implemented — see Security Checklist for planned approach.
- Automated tests, CI pipeline, Docker: not completed in this timeframe.
- Observability: structured request logging (Pino) is implemented; metrics/tracing not added.

## Design Decisions Worth Noting
- **Idempotency**: booking requests require a client-generated `idempotencyKey`; duplicate submissions return the original result instead of erroring or duplicating.
- **Concurrency**: slot booking uses a Prisma transaction with a conditional `updateMany` (only succeeds if slot is still unbooked) — prevents double-booking under concurrent requests without needing external locking.
- **Security**: bcrypt (12 rounds) for passwords, JWT with separate access/refresh secrets, Zod validation on all inputs, Helmet for HTTP headers, generic auth error messages to prevent account enumeration.