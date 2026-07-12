# Architecture Document — Amrutam Telemedicine Backend

## 1. Overview

A REST API for a telemedicine platform supporting patient/doctor authentication,
doctor availability management, and appointment booking. Built with Node.js,
Express 5, PostgreSQL (Neon, managed), and Prisma 7 ORM.

---

## 2. High-Level Architecture

```text
Client (Postman / Frontend)
        |
        v
Express App
├── Helmet (security headers)
├── CORS
├── Pino HTTP Logger (structured request logging)
├── Route Layer
│   ├── Authentication Routes
│   ├── Doctor Routes
│   └── Appointment Routes
│
├── Middleware
│   ├── Zod Validation
│   ├── JWT Authentication (protect)
│   └── RBAC Authorization (restrictTo)
│
├── Controller Layer
│
├── Service Layer
│
└── Global Error Middleware
        |
        v
Prisma Client
(@prisma/adapter-pg)
        |
        v
PostgreSQL (Neon)
```

### Layering Rationale

The project follows a layered architecture separating:

- Presentation Layer (Routes + Controllers)
- Business Logic Layer (Services)
- Data Access Layer (Prisma)

This keeps business logic independent of HTTP concerns, making the codebase
easier to test, maintain, and extend.

---

## 3. Data Flow — Appointment Booking

1. Client sends `POST /api/appointments` with JWT and:

```json
{
  "slotId": "...",
  "idempotencyKey": "..."
}
```

2. JWT middleware authenticates the request.
3. RBAC middleware verifies the user is a **PATIENT**.
4. Zod validates request payload.
5. Service checks whether the idempotency key already exists.
6. A Prisma transaction begins.
7. The availability slot is updated only if:

```
isBooked = false
```

8. If no rows are updated, another request already booked the slot and a **409 Conflict** is returned.
9. Otherwise an Appointment record is created.
10. Transaction commits and appointment details are returned.

---

## 4. Booking Sequence Diagram

```text
Patient        API        AuthMW      RBAC      Service         Database
   |            |            |          |            |               |
   | POST /appointments      |          |            |               |
   |---------->|             |          |            |               |
   |           | Verify JWT  |          |            |               |
   |           |-----------> |          |            |               |
   |           | <-----------|          |            |               |
   |           | Check Role  |--------->|            |               |
   |           | <-----------|          |            |               |
   |           | Validate Request       |            |               |
   |           |----------------------->|            |               |
   |           |                        | Check Idempotency          |
   |           |----------------------------------------------->     |
   |           |<-----------------------------------------------     |
   |           | Begin Transaction                                  |
   |           |----------------------------------------------->     |
   |           | Update Slot (isBooked = false)                     |
   |           |----------------------------------------------->     |
   |           |<-----------------------------------------------     |
   |           | Insert Appointment                                |
   |           |----------------------------------------------->     |
   |           | Commit Transaction                                |
   |<----------| 201 Created                                        |
```

---

## 5. Entity Relationship Diagram

```text
User (1)
   │
   ├───────────────< DoctorProfile (0..1)
   │
   └───────────────< Appointment (0..N) [Patient]

DoctorProfile (1)
   ├───────────────< Availability (0..N)
   │
   └───────────────< Appointment (0..N)

Availability (1)
   └─────────────── Appointment (0..1)

Appointment (1)
   └─────────────── Consultation (0..1)

Consultation (1)
   └─────────────── Prescription (0..1)
```

### Database Constraints

- `User.email` is unique.
- `DoctorProfile.userId` is unique.
- `Appointment.slotId` is unique.
- `Appointment.idempotencyKey` is unique.

---

## 6. Concurrency & Idempotency

### Idempotency

Clients generate a UUID for every booking attempt.

If the same request is retried because of:

- Network failure
- Double click
- Timeout

the server returns the original appointment instead of creating duplicates.

### Concurrency

Booking occurs inside a Prisma transaction.

The availability row is updated only when:

```text
isBooked = false
```

Only one transaction can successfully update the slot.

If another request reaches the database simultaneously, it receives:

```http
409 Conflict
```

This prevents double booking without requiring Redis locks or database row locking.

---

## 7. Security

Implemented security measures include:

- Password hashing using bcrypt (12 salt rounds)
- JWT Access Token (15 minutes)
- JWT Refresh Token (7 days)
- Separate JWT secrets
- Helmet security headers
- CORS protection
- Zod request validation
- Role-Based Access Control (RBAC)
- Generic authentication error messages
- Environment variables stored in `.env`
- Global error handler that hides internal stack traces in production

---

## 8. Observability

Current implementation:

- Structured JSON logging using Pino
- HTTP request logging using pino-http
- `/health` endpoint

Future improvements:

- Prometheus metrics
- OpenTelemetry tracing
- Application Performance Monitoring (APM)
- Request trace IDs

---

## 9. Scalability

Current architecture supports:

- Stateless JWT authentication
- Horizontal API scaling
- Neon PostgreSQL connection pooling
- Indexed database queries for:
  - Availability search
  - Doctor appointments
  - Patient appointments

Future improvements:

- Redis caching
- Read replicas
- Background job queues
- Notification workers

---

## 10. Known Gaps

The following features are intentionally left for future development:

- Consultation workflow
- Prescription APIs
- Rate limiting
- Multi-factor authentication (MFA)
- Audit logging
- Admin analytics dashboard
- Automated testing
- CI/CD pipeline
- Docker deployment
- Metrics and distributed tracing

These limitations are documented explicitly to provide transparency regarding the current project scope.

---

## Summary

The backend follows a layered architecture with clear separation of concerns between routing, controllers, services, and persistence. Security is enforced using JWT authentication, RBAC authorization, request validation, and secure password hashing. Prisma transactions ensure safe concurrent appointment booking while PostgreSQL provides reliable persistence. The architecture is designed to be maintainable, scalable, and extensible for future enhancements.