# WriteCraft Backend API

RESTful API for the WriteCraft blogging platform built with **NestJS**, **PostgreSQL**, and **Prisma ORM**.

## 📋 Prerequisites

- **Node.js** 18+ and **npm** or **yarn**
- **PostgreSQL** database (we recommend Supabase for easy setup)
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration (Required)
DATABASE_URL="postgresql://user:password@host:port/database_name"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Configuration
PORT=3001

# Rate Limiting Configuration
RATE_LIMIT_TTL=60              # Time window in seconds
RATE_LIMIT_GLOBAL=100          # Global rate limit
RATE_LIMIT_AUTH_LOGIN=10       # Login attempts per window
RATE_LIMIT_AUTH_REGISTER=3     # Registration attempts per window
RATE_LIMIT_PUBLIC_FEED=50      # Feed requests per window
RATE_LIMIT_PUBLIC_BLOG=100     # Blog requests per window

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Getting a PostgreSQL Database

**Using Supabase (Recommended):**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string and paste it as `DATABASE_URL`

**Using Local PostgreSQL:**

```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create a database
createdb writecraft

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/writecraft"
```

### 3. Set up the Database

Run Prisma migrations to create tables:

```bash
npx prisma migrate dev
```

This will:

- Create all necessary database tables
- Run all migration files
- Generate Prisma client

### 4. Start the Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## 📚 Available Scripts

```bash
# Development
npm run start              # Start server
npm run start:dev         # Start with auto-reload
npm run start:debug       # Start with debugging
npm run start:prod        # Production mode

# Building
npm run build             # Build for production

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Generate coverage report
npm run test:debug        # Debug tests
npm run test:e2e          # End-to-end tests

# Database
npx prisma migrate dev    # Run migrations
npx prisma studio        # Open Prisma Studio GUI
npx prisma generate      # Generate Prisma client
```

## 🏗️ Project Structure

```
src/
├── main.ts                        # Application entry point
├── app.module.ts                  # Root module
├── app.controller.ts              # Root controller
├── common/
│   ├── decorators/                # Custom decorators (@CurrentUser, @Public)
│   ├── exceptions/                # Custom exceptions
│   ├── filters/                   # Exception filters
│   ├── guards/                    # Auth & ownership guards
│   ├── logger/                    # Logging service
│   ├── pipes/                     # Validation pipes
│   └── utils/                     # Helper utilities
├── modules/
│   ├── auth/                      # Authentication (JWT)
│   ├── blogs/                     # Blog CRUD operations
│   ├── comments/                  # Comments on blogs
│   ├── likes/                     # Blog likes
│   ├── users/                     # User profiles
│   └── public/                    # Public endpoints
└── prisma/                        # Database service
```

## ⚖️ Key Decisions & Tradeoffs

This project prioritizes **developer productivity, maintainability, and scalability for a mid-scale SaaS blogging platform** while keeping operational complexity low.

---

### Architecture — Modular Monolith (NestJS Modules)

The API follows a **modular monolith architecture**, separating domains into independent modules such as `auth`, `blogs`, `comments`, `likes`, and `users`.

**Pros**

- Faster development and simpler deployments compared to microservices.
- Clear domain boundaries improve maintainability.
- Easier debugging with a single runtime and database.

**Tradeoffs**

- Horizontal scaling is less flexible than distributed services.
- Requires careful module boundaries as the system grows.

Microservices were intentionally avoided at this stage to reduce infrastructure complexity and premature optimization.

---

### Framework — NestJS

NestJS was selected over minimal frameworks like Express for its structured architecture and strong Type safety.

**Pros**

- Built-in dependency injection improves testing and decoupling.
- Guards, interceptors, and filters enable centralized cross-cutting concerns.
- Opinionated structure supports team collaboration.

**Tradeoffs**

- More boilerplate compared to lightweight frameworks.
- Slight learning curve for developers unfamiliar with decorators or DI.

---

### Database — PostgreSQL

PostgreSQL is used as the primary datastore due to strong relational guarantees between users, blogs, comments, and likes.

**Pros**

- ACID compliance ensures data integrity.
- Powerful indexing and query capabilities.
- Mature ecosystem and reliability.

**Tradeoffs**

- Schema migrations require planning.
- Operational setup is heavier compared to schema-less databases.

NoSQL databases were considered but rejected due to relational querying needs.

---

### ORM — Prisma

Prisma ORM provides strongly typed database access and migration tooling.

**Pros**

- Excellent developer experience and auto-generated types.
- Reduced SQL injection risk via parameterized queries.
- Easy schema evolution through migrations.

**Tradeoffs**

- Less flexibility for extremely complex or highly optimized SQL queries.
- Adds an abstraction layer between application and database.

---

### Authentication — JWT (Stateless)

Authentication uses JWT access tokens.

**Pros**

- Stateless authentication enables horizontal scaling.
- Works seamlessly with frontend SPA applications.
- No session store dependency.

**Tradeoffs**

- Token revocation is harder than session-based systems.
- Requires expiration and refresh strategies.

---

### Validation — Zod Schemas

Input validation uses Zod schemas applied through NestJS pipes.

**Pros**

- Runtime validation with TypeScript inference.
- Reusable schemas across services and DTOs.
- Consistent API contracts.

**Tradeoffs**

- Minor runtime overhead during validation.
- Additional dependency compared to decorator-based validation.

---

### Pagination Strategy

Offset pagination (`page` + `limit`) is implemented for list endpoints.

**Pros**

- Simple frontend integration.
- Easy implementation and debugging.

**Tradeoffs**

- Performance degradation on extremely large datasets.
- Cursor pagination may be introduced in future scaling phases.

---

### Security Controls

Security features include JWT authentication, rate limiting, validation pipes, and ownership guards.

**Pros**

- Prevents brute-force login attempts.
- Centralized authorization logic reduces controller duplication.
- Input validation protects against malformed requests.

**Tradeoffs**

- Requires monitoring and tuning rate limits under real traffic conditions.

---

### Deployment Strategy

Docker support is optional to support multiple deployment environments.

**Pros**

- Flexible deployment to VPS or container orchestration platforms.
- Easier environment reproducibility.

**Tradeoffs**

- Adds Docker knowledge requirements for teams adopting containers.

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description             | Auth Required |
| ------ | ----------- | ----------------------- | ------------- |
| POST   | `/register` | Register new user       | No            |
| POST   | `/login`    | Login and get JWT token | No            |
| POST   | `/logout`   | Logout user             | Yes           |

**Register Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Blogs (`/api/blogs`)

| Method | Endpoint | Description               | Auth Required |
| ------ | -------- | ------------------------- | ------------- |
| GET    | `/`      | Get all blogs (paginated) | No            |
| GET    | `/:slug` | Get single blog by slug   | No            |
| POST   | `/`      | Create new blog           | Yes           |
| PATCH  | `/:id`   | Update blog               | Yes (owner)   |
| DELETE | `/:id`   | Delete blog               | Yes (owner)   |

**Create Blog Request:**

```json
{
  "title": "My Amazing Blog Post",
  "content": "Blog content here...",
  "summary": "Short summary"
}
```

### Comments (`/api/comments`)

| Method | Endpoint        | Description           | Auth Required |
| ------ | --------------- | --------------------- | ------------- |
| GET    | `/blog/:blogId` | Get comments for blog | No            |
| POST   | `/`             | Create comment        | Yes           |
| DELETE | `/:id`          | Delete comment        | Yes (owner)   |

**Create Comment Request:**

```json
{
  "content": "Great article!",
  "blogId": "blog-id"
}
```

### Likes (`/api/likes`)

| Method | Endpoint        | Description      | Auth Required |
| ------ | --------------- | ---------------- | ------------- |
| POST   | `/`             | Like/unlike blog | Yes           |
| GET    | `/blog/:blogId` | Get likes count  | No            |

**Like Request:**

```json
{
  "blogId": "blog-id"
}
```

### Users (`/api/users`)

| Method | Endpoint | Description         | Auth Required |
| ------ | -------- | ------------------- | ------------- |
| GET    | `/:id`   | Get user profile    | No            |
| PATCH  | `/:id`   | Update user profile | Yes (owner)   |

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. **Register** - Create an account
2. **Login** - Get access token
3. **Include Token** - Send token in `Authorization` header: `Bearer <token>`

Protected routes require:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt for password security
- **Rate Limiting** - Prevent abuse on sensitive endpoints
- **CORS Protection** - Control cross-origin requests
- **Input Validation** - Zod schemas for all inputs
- **SQL Injection Prevention** - Prisma parameterized queries
- **Authorization Guards** - Ownership verification

## 🗄️ Database

### Prisma ORM

The project uses **Prisma** as the ORM for database operations:

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# View database migrations
npx prisma migrate status

# Create a new migration after schema changes
npx prisma migrate dev --name migration_name

# Generate Prisma client (auto-run during install)
npx prisma generate
```

### Key Models

- **User** - User accounts, email, password
- **Blog** - Blog posts with title, content, slug
- **Comment** - Comments linked to blogs
- **Like** - User likes on blogs

## 📊 Pagination

List endpoints support pagination:

```
GET /api/blogs?page=1&limit=10
```

Response includes:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

Test files use Jest and are named `*.spec.ts`

## 🔧 Configuration

### Validation

Input validation uses **Zod** schemas defined in DTO files:

- `src/modules/*/dto/*.ts`

All requests are validated automatically by pipes.

### Rate Limiting

Global and endpoint-specific rate limits are configured in `.env`:

- Prevents brute force attacks
- Protects heavy operations
- Differs for auth endpoints vs public endpoints

### CORS

CORS is enabled for the frontend URL specified in `.env`:

```
FRONTEND_URL=http://localhost:3000
```

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

Uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

## 🚀 Production Deployment

### Building

```bash
npm run build
```

Outputs compiled code to `dist/` directory.

### Running in Production

```bash
npm run start:prod
```

### Environment Variables

In production, ensure `.env` includes:

- Strong `JWT_SECRET`
- Production database URL
- Correct `FRONTEND_URL`
- Appropriate rate limits

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/src/main"]
```

Build and run:

```bash
docker build -t writecraft-api .
docker run -p 3001:3001 --env-file .env writecraft-api
```

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
# Regenerate Prisma client
npx prisma generate
```

### Database connection fails

- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Test connection: `npm run prisma db execute --stdin < test.sql`

### Port already in use

```bash
# Use different port
PORT=3002 npm run start:dev

# Or kill process on port 3001
lsof -i :3001
kill -9 <PID>
```

### JWT token invalid

- Ensure `JWT_SECRET` is consistent
- Check token format: `Authorization: Bearer <token>`
- Verify token hasn't expired

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io)

## 📄 License

Unlicensed - All rights reserved.
