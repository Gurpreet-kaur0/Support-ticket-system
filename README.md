# Support Ticket Management System

A full-stack Mini Helpdesk System that allows users to raise support tickets and administrators to manage and resolve them.

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Frontend:** React.js (Vite), TypeScript, Tailwind CSS
- **Authentication:** JWT (JSON Web Tokens)
- **Containerization:** Docker & Docker Compose

## Features

### User Features
- Register and login with secure JWT authentication
- Create, view, edit, and delete support tickets
- Track ticket status (Open, In Progress, Resolved, Closed)
- Add comments to tickets
- Search, filter, and paginate tickets

### Admin Features
- Dashboard with ticket statistics (by status, priority, category)
- View and manage all tickets from all users
- Update ticket status and priority
- Filter, sort, and search across all tickets
- View activity logs for all system events
- Respond to any ticket with comments

### Event-Driven Architecture
- Activity logging via Node.js EventEmitter
- Events tracked: Ticket Created, Updated, Status Changed, Resolved, Deleted, Comment Added
- Full activity log accessible to admins

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
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd support-ticket-system
   ```

2. **Setup Backend:**
   ```bash
   cd server
   cp .env.example .env    # Edit .env with your MongoDB URI and JWT secret
   npm install
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Docker Deployment

```bash
docker-compose up --build
```

The app will be available at http://localhost:3000.

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
All public registrations are created with the `user` role — the role field is not accepted from clients to prevent privilege escalation. To create an admin account, run:
```bash
cd server
npm run create-admin -- "Admin Name" admin@example.com <password>
```
This creates a new admin user, or promotes an existing user with that email to admin.

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
- `sortBy` - Sort field (default: createdAt)
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

## Implementation Decisions

1. **TypeScript** for both frontend and backend for type safety and maintainability.
2. **Event-driven architecture** using Node.js EventEmitter for decoupled activity logging.
3. **JWT stored in localStorage** with Axios interceptors for automatic token attachment and 401 handling.
4. **Role-based access control** via middleware — users see only their tickets, admins see all.
5. **Tailwind CSS** for rapid, consistent UI development without custom CSS overhead.
6. **MongoDB indexes** on frequently queried fields (createdBy, status+priority, ticket+createdAt) for performance.
7. **Input validation** using express-validator on all mutation endpoints.
8. **Password hashing** with bcrypt (12 salt rounds) — passwords never stored or returned in plaintext.

## Bonus Features Implemented

- Search and pagination on all list endpoints
- Sorting and multi-filter support
- Admin dashboard with ticket statistics and charts
- Activity log / audit trail
- Docker Compose for one-command deployment
- Full React frontend with responsive design
