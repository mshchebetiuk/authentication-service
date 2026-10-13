# Authentication Service

A RESTful authentication and authorization API built with Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL.

The project demonstrates secure password hashing, JWT-based authentication, refresh token rotation, role-based access control (RBAC), automated integration testing, and continuous integration with GitHub Actions.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit
- **Testing:** Vitest, Supertest
- **CI:** GitHub Actions
- **Package Manager:** pnpm

## Features

- User registration with input validation
- Secure password hashing with bcrypt
- User login with JWT access tokens
- Refresh token rotation
- Refresh token revocation on logout
- Protected user profile endpoint
- Role-based access control (`USER` and `ADMIN`)
- Centralized error handling
- Security headers using Helmet
- Rate limiting for registration and login
- PostgreSQL database migrations
- Automated integration tests
- Continuous integration with GitHub Actions

## API Endpoints

| Method | Endpoint         | Description              | Authentication |
| ------ | ---------------- | ------------------------ | -------------- |
| GET    | `/health`        | Health check             | Public         |
| POST   | `/auth/register` | Register a user          | Public         |
| POST   | `/auth/login`    | Authenticate a user      | Public         |
| POST   | `/auth/refresh`  | Rotate refresh token     | Refresh token  |
| POST   | `/auth/logout`   | Revoke refresh token     | Refresh token  |
| GET    | `/users/me`      | Get current user profile | Access token   |
| GET    | `/admin/users`   | List users               | ADMIN role     |

## API Usage Examples

Base URL: `http://localhost:3000`

### 1. Register User

**POST** `/auth/register`

Request:

```http
POST /auth/register
Content-Type: application/json

{
  "email": "developer@example.com",
  "password": "StrongPassword123",
  "name": "Developer"
}
```

Successful response: `201 Created`

### 2. Login

**POST** `/auth/login`

Request:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "developer@example.com",
  "password": "StrongPassword123"
}
```

Successful response: `200 OK`

The response includes an access token, a refresh token, and user information.

### 3. Get Current User

**GET** `/users/me`

Request:

```http
GET /users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response: `200 OK`

Returns the authenticated user's profile without the password hash.

### 4. Refresh Tokens

**POST** `/auth/refresh`

Request:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

Successful response: `200 OK`

Returns a new access token and a new refresh token. The previous refresh token becomes invalid.

### 5. Logout

**POST** `/auth/logout`

Request:

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

Successful response: `200 OK`

Revokes the submitted refresh token.

### 6. Get All Users (ADMIN Only)

**GET** `/admin/users`

Request:

```http
GET /admin/users
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
```

Successful response: `200 OK`

Returns a list of users without password hashes.

Users with the `USER` role receive `403 Forbidden`.

### Common HTTP Status Codes

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| `200`  | Successful request                       |
| `201`  | Resource created                         |
| `400`  | Invalid request or validation error      |
| `401`  | Missing, invalid, or expired credentials |
| `403`  | Insufficient permissions                 |
| `404`  | Resource not found                       |
| `409`  | Resource already exists                  |
| `429`  | Too many requests                        |
| `500`  | Internal server error                    |

### Security Notes

- Never share access or refresh tokens publicly.
- Do not include passwords or tokens in Git commits.
- Refresh tokens are rotated after successful refresh requests.
- Logging out revokes the supplied refresh token, but previously issued access tokens remain valid until they expire.
- New accounts receive the `USER` role by default. Administrative privileges must not be assigned through public registration.

## Authentication Flow

1. Register an account using `/auth/register`.
2. Log in using `/auth/login`.
3. Receive an access token and a refresh token.
4. Access protected endpoints using the `Authorization: Bearer <accessToken>` header.
5. Request new tokens using `/auth/refresh`.
6. Log out using `/auth/logout` to revoke the submitted refresh token.

Access tokens expire after 15 minutes. Refresh tokens expire after 7 days and are stored as hashes in PostgreSQL.

## Installation & Local Setup

### Prerequisites

Before running the project, make sure you have installed:

- Node.js 24
- pnpm (use the version specified in `package.json`)
- PostgreSQL 18
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/mshchebetiuk/authentication-service.git
cd authentication-service
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/authentication_service"
JWT_ACCESS_SECRET="replace_with_a_long_random_secret"
PORT=3000
```

Replace `YOUR_PASSWORD` with your local PostgreSQL password.

Use a strong, randomly generated JWT secret. Never commit `.env` files or real credentials to Git.

### 4. Create the Database

Create a PostgreSQL database named:

```text
authentication_service
```

For example, using PostgreSQL's command-line utility:

```bash
createdb -U postgres authentication_service
```

### 5. Generate Prisma Client

```bash
pnpm exec prisma generate
```

### 6. Apply Database Migrations

```bash
pnpm exec prisma migrate deploy
```

### 7. Start the Development Server

```bash
pnpm dev
```

By default, the API is available at:

```text
http://localhost:3000
```

Verify that the server is running:

```http
GET http://localhost:3000/health
```

### Test Database Setup

Integration tests use a separate PostgreSQL database to avoid modifying development data.

Create a database named:

```text
authentication_service_test
```

Create a `.env.test` file:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/authentication_service_test"
JWT_ACCESS_SECRET="replace_with_a_separate_random_test_secret"
```

Apply migrations to the test database using the test environment configuration before running the tests.

The Vitest configuration validates that integration tests connect only to `authentication_service_test`.

Run:

```bash
pnpm test
```

**Important:** Do not use a production database for integration tests.

## Testing

Run the integration tests:

```bash
pnpm test
```

Run TypeScript type checking:

```bash
pnpm typecheck
```

Build the project:

```bash
pnpm build
```

The project currently includes 29 integration tests covering authentication, authorization, token rotation, logout, security middleware, and error handling.

## Continuous Integration

GitHub Actions automatically runs checks on pushes and pull requests targeting `main`.

The CI pipeline includes:

- Dependency installation
- PostgreSQL service initialization
- Prisma Client generation
- Database migrations
- TypeScript type checking
- Integration testing
- Production build

## Security

- Passwords are hashed before database storage.
- Refresh tokens are stored as SHA-256 hashes.
- Protected endpoints require valid JWT access tokens.
- Administrative endpoints enforce role-based permissions.
- Input validation uses Zod.
- Authentication endpoints use rate limiting.
- HTTP security headers are configured with Helmet.
- Unexpected server errors are handled centrally.

## Project Status

The core authentication and authorization functionality is implemented and covered by automated integration tests.

This project is part of a backend development portfolio focused on TypeScript, REST API design, PostgreSQL, application security, and software engineering practices.
