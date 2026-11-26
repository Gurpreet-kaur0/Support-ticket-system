# Support Ticket Management System

A full-stack Mini Helpdesk System that lets users raise support tickets and lets administrators triage, respond to, and resolve them — built with an event-driven backend, role-based access control, and a clean React dashboard for both audiences.

**Live Demo:** _[coming soon](#live-demo)_ · **Tech Stack:** Node.js · Express · TypeScript · MongoDB · React · Docker

---

## Screenshots

| Login | User Dashboard |
|---|---|
| ![Login page](screenshots/login.png) | ![User dashboard](screenshots/user-dashboard.png) |

| Admin Dashboard | Ticket Management |
|---|---|
| ![Admin dashboard](screenshots/admin-dashboard.png) | ![Ticket management](screenshots/ticket-management.png) |

<details>
<summary>Ticket detail & comment thread</summary>

![Ticket detail](screenshots/ticket-detail.png)
</details>

---

## Features

### User
- Register and log in with secure JWT authentication
- Create, view, edit, and delete your own support tickets
- Track ticket status (Open, In Progress, Resolved, Closed)
- Add comments to tickets and see admin responses in the same thread
- Search, filter, and paginate your tickets

### Admin
- Dashboard with ticket statistics (by status, priority, category)
- View and manage tickets from all users in one place
- Update any ticket's status and priority
- Filter, sort, and search across all tickets
- Respond to any ticket with comments
- Full activity log / audit trail of every action in the system

### Event-Driven Architecture
- Activity logging via a Node.js `EventEmitter` — business logic stays decoupled from audit logging
- Events tracked: `TICKET_CREATED`, `TICKET_UPDATED`, `STATUS_CHANGED`, `TICKET_RESOLVED`, `TICKET_DELETED`, `COMMENT_ADDED`
- Full activity log, filterable by ticket or event type, accessible to admins

### Security
- Passwords hashed with bcrypt (12 salt rounds) — never stored or returned in plaintext
- JWT-based auth with role-based access control enforced server-side on every route
- Public registration always creates a `user` role — admin accounts can only be created via a server-side script, preventing privilege escalation
- Input validation (`express-validator`) on every mutation endpoint
- Ownership checks on tickets/comments — users can only access their own data, admins can access everything

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Frontend | React.js (Vite), TypeScript, Tailwind CSS |
| Authentication | JWT (JSON Web Tokens), bcrypt |
| Containerization | Docker & Docker Compose |

---

## Live Demo

> _To be filled in after deployment — see [Deployment](#deployment) below for the hosting plan._

| | URL |
|---|---|
| Frontend | `TBD` |
| Backend API | `TBD/api/health` |

**Try it with a demo account**, or register your own — new accounts always start as a regular `user`. To explore admin features, use the credentials provided in the demo link once published.

---

## Project Structure

```
├── server/                  # Backend API
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── events/          # Event emitter & handlers
│   │   ├── middleware/      # Auth & authorization middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── scripts/         # One-off scripts (e.g. create-admin)
│   │   ├── utils/           # JWT token utility
│   │   └── index.ts         # Server entry point
│   ├── Dockerfile
│   └── package.json
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # Page components
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Router & app shell
│   ├── Dockerfile
│   └── package.json
├── screenshots/             # README screenshots
├── docker-compose.yml
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn
- Docker (optional, for one-command setup)

### Option A: Docker (recommended — one command)

```bash
git clone <repository-url>
cd support-ticket-system
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Option B: Local development (without Docker)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd support-ticket-system
   ```

2. **Backend:**
   ```bash
   cd server
   cp .env.example .env    # Edit .env with your MongoDB URI and JWT secret
   npm install
   npm run dev
   ```

3. **Frontend** (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Creating an admin account

Admins cannot self-register through the signup form (by design — see [Security](#security)). Create one with:

```bash
cd server
npm run create-admin -- "Admin Name" admin@example.com <password>
```

Or, if running via Docker:
```bash
docker exec helpdesk-server npm run create-admin -- "Admin Name" admin@example.com <password>
```

This creates a new admin user, or promotes an existing user with that email to admin.

---

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Get current user | Yes |

**Register Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "123456" }
```

**Login Body:**
```json
{ "email": "john@example.com", "password": "123456" }
```

### Tickets

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/tickets` | Create ticket | Yes | User |
| GET | `/api/tickets/my` | Get my tickets | Yes | User |
| GET | `/api/tickets/all` | Get all tickets | Yes | Admin |
| GET | `/api/tickets/stats` | Get ticket stats | Yes | Admin |
| GET | `/api/tickets/:id` | Get ticket detail | Yes | Owner/Admin |
| PUT | `/api/tickets/:id` | Update ticket | Yes | Owner/Admin |
| DELETE | `/api/tickets/:id` | Delete ticket | Yes | Owner/Admin |

**Query Parameters (GET endpoints):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `priority` - Filter by priority (low, medium, high, urgent)
- `category` - Filter by category (bug, feature, general, account, billing)
- `search` - Search in title and description
- `sortBy` - Sort field (default: createdAt; whitelisted to createdAt, updatedAt, priority, status, title)
- `sortOrder` - asc or desc (default: desc)

**Create Ticket Body:**
```json
{
  "title": "Cannot login to dashboard",
  "description": "Getting 500 error when trying to access the admin panel",
  "category": "bug",
  "priority": "high"
}
```

### Comments

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/comments/:ticketId` | Add comment | Yes | Owner/Admin |
| GET | `/api/comments/:ticketId` | Get comments | Yes | Owner/Admin |

### Activity Logs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/activity` | Get activity logs | Yes | Admin |

**Query Parameters:**
- `ticketId` - Filter by ticket
- `event` - Filter by event type
- `page`, `limit` - Pagination

A Postman collection can be generated from this table, or import the endpoints above directly — every route and body shape needed is documented here.

---

## Database Design

### Users Collection
| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Bcrypt hashed password |
| role | String | 'user' or 'admin' |
| createdAt | Date | Auto-generated |

### Tickets Collection
| Field | Type | Description |
|-------|------|-------------|
| title | String | Ticket title (max 200 chars) |
| description | String | Detailed description (max 5000 chars) |
| category | String | bug, feature, general, account, billing |
| priority | String | low, medium, high, urgent |
| status | String | open, in_progress, resolved, closed |
| createdBy | ObjectId | Reference to User |
| createdAt | Date | Auto-generated |
| updatedAt | Date | Auto-updated |

### Comments Collection
| Field | Type | Description |
|-------|------|-------------|
| content | String | Comment text (max 2000 chars) |
| ticket | ObjectId | Reference to Ticket |
| author | ObjectId | Reference to User |
| createdAt | Date | Auto-generated |

### Activity Logs Collection
| Field | Type | Description |
|-------|------|-------------|
| event | String | Event type (TICKET_CREATED, etc.) |
| description | String | Human-readable description |
| ticket | ObjectId | Reference to Ticket |
| performedBy | ObjectId | Reference to User |
| metadata | Mixed | Additional event data |
| createdAt | Date | Auto-generated |

**Why this shape:** Tickets and Comments reference `User` by ObjectId rather than embedding user data, so a single source of truth exists for identity (name/email changes propagate automatically via `.populate()`). Activity Logs reference the ticket loosely (no cascading delete) so the audit trail survives even after a ticket is deleted — you can see the full history of something that no longer exists. Indexes are set on `createdBy`, `status+priority`, and `ticket+createdAt` to keep the common list/filter queries fast as data grows.

---

## Implementation Decisions

1. **TypeScript** for both frontend and backend for type safety and maintainability.
2. **Event-driven architecture** using Node.js EventEmitter for decoupled activity logging.
3. **JWT stored in localStorage** with Axios interceptors for automatic token attachment and session-expiry handling.
4. **Role-based access control** via middleware — users see only their tickets, admins see all.
5. **Tailwind CSS** for rapid, consistent UI development without custom CSS overhead.
6. **MongoDB indexes** on frequently queried fields (createdBy, status+priority, ticket+createdAt) for performance.
7. **Input validation** using express-validator on all mutation endpoints.
8. **Password hashing** with bcrypt (12 salt rounds) — passwords never stored or returned in plaintext.
9. **No client-controlled roles** — registration always assigns `user`; admin provisioning is a deliberate, server-side-only action.

## Bonus Features Implemented

- Search and pagination on all list endpoints
- Sorting and multi-filter support
- Admin dashboard with ticket statistics and charts
- Activity log / audit trail
- Docker Compose for one-command deployment
- Full React frontend with responsive design

## Deployment

The app is ready to deploy as two independently hosted pieces — backend API and frontend — communicating over HTTPS rather than relying on same-origin proxying. A `render.yaml` blueprint is included for the backend.

### 1. Database — MongoDB Atlas (free tier)
1. Create a free account at MongoDB Atlas and spin up an M0 (free) cluster.
2. Create a database user and allow network access from anywhere (`0.0.0.0/0`) for simplicity, or Render's IP ranges if you want it tighter.
3. Copy the connection string (`mongodb+srv://...`).

### 2. Backend — Render
1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint**, point it at the repo — it will pick up `render.yaml` and create the `helpdesk-server` web service automatically (`JWT_SECRET` is auto-generated).
3. Set the `MONGODB_URI` environment variable on that service to your Atlas connection string from step 1.
4. Once deployed, confirm `https://<your-service>.onrender.com/api/health` returns `{"status":"ok"}`.

### 3. Frontend — Vercel or Netlify
1. Import the repo, set the project root to `client/`.
2. Build command: `npm run build`, output directory: `dist` (both platforms detect this automatically for Vite).
3. Set an environment variable `VITE_API_URL` to `https://<your-backend-domain>/api` — this is read at build time (see `client/src/services/api.ts` and `.env.example`).
4. Deploy. The frontend will now call the Render backend directly instead of relying on the Docker/nginx proxy used in local development.

Once both are live, update the [Live Demo](#live-demo) table above with the real URLs.
