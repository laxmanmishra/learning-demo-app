# Full-Stack Demo Application

A comprehensive full-stack demo showcasing modern web development technologies.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Primary Database**: PostgreSQL
- **Secondary Database**: MySQL (analytics)
- **Caching**: Redis
- **Real-time**: Socket.io (WebSockets)
- **Authentication**: JWT + Passport.js (Google OAuth2)
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Next.js 14 (SSR/SSG)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Real-time**: Socket.io Client

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── database/        # Database connections (PostgreSQL, MySQL, Redis)
│   │   ├── middleware/      # Express middleware (auth, validation)
│   │   ├── routes/          # API routes
│   │   ├── tests/           # Jest tests
│   │   ├── types/           # TypeScript types
│   │   ├── websocket/       # WebSocket handlers
│   │   └── index.ts         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   └── context/         # React context (Auth)
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MySQL 8+
- Redis 7+

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Set Up Databases

#### PostgreSQL
```sql
CREATE DATABASE demo_db;
```

#### MySQL
```sql
CREATE DATABASE demo_mysql_db;
```

### 4. Start the Applications

```bash
# Terminal 1 - Backend (runs on port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (runs on port 3000)
cd frontend
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/google` | Google OAuth2 login |
| GET | `/api/auth/google/callback` | Google OAuth2 callback |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts (paginated) |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create post (auth required) |
| PUT | `/api/posts/:id` | Update post (auth required) |
| DELETE | `/api/posts/:id` | Delete post (auth required) |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `{ content, to?, room? }` | Send message |
| `typing` | `{ to?, room?, isTyping }` | Typing indicator |
| `join_room` | `roomId` | Join a room |
| `leave_room` | `roomId` | Leave a room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `WebSocketMessage` | Receive message |
| `typing` | `WebSocketMessage` | Typing indicator |
| `presence` | `WebSocketMessage` | User online/offline |
| `notification` | `WebSocketMessage` | System notification |

## Testing

```bash
cd backend
npm test           # Run tests
npm run test:watch # Watch mode
```

## Postman Collection

Import the Postman collection from `postman/demo-api.postman_collection.json` to test API endpoints.

### Environment Variables for Postman
- `base_url`: `http://localhost:3001`
- `token`: JWT token (set after login)

## Features Demonstrated

- ✅ **REST API** with Express.js
- ✅ **TypeScript** for type safety
- ✅ **PostgreSQL** as primary database
- ✅ **MySQL** for analytics data
- ✅ **Redis** for caching and sessions
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Google OAuth2** social login
- ✅ **WebSockets** for real-time features
- ✅ **Request Validation** with Zod
- ✅ **Unit Testing** with Jest
- ✅ **Next.js SSR/SSG** for frontend
- ✅ **Tailwind CSS** for styling
- ✅ **Responsive Design** mobile-first

## License

MIT
