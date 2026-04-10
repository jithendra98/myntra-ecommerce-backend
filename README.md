# 🛍️ Myntra E-commerce Backend API

A **production-ready** RESTful e-commerce backend built with Node.js, Express.js, MongoDB, and Redis.

## ✨ Features

- **JWT Authentication** with bcrypt password hashing & role-based access (Admin/User)
- **Product Management** with CRUD, pagination, filtering & full-text search
- **Redis Caching** for product listings with automatic cache invalidation
- **Shopping Cart** with stock validation & edge case handling
- **Order Management** with status flow (Pending → Shipped → Delivered)
- **Mock Payment API** with simulated success/failure
- **Rate Limiting** to prevent API abuse
- **Input Validation** using express-validator
- **Request Logging** with Morgan (file + console)
- **Environment-based Config** (development / production)
- **Security** headers with Helmet & CORS

---

## 📁 Project Structure

```
├── config/
│   ├── db.js              # MongoDB connection
│   ├── redis.js           # Redis client (graceful degradation)
│   └── config.js          # Environment-based settings
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── paymentController.js
├── middleware/
│   ├── authMiddleware.js   # JWT protect + role authorize
│   ├── errorHandler.js     # Global error handler
│   ├── logger.js           # Morgan request logging
│   ├── rateLimiter.js      # express-rate-limit
│   └── validate.js         # express-validator chains
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── paymentRoutes.js
├── utils/
│   ├── ApiError.js         # Custom error class
│   └── cache.js            # Redis cache helpers
├── .env.example
├── server.js               # Entry point
├── postman_collection.json # Postman import file
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** v6+ ([Download](https://www.mongodb.com/try/download/community)) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Redis** (Optional — app works without it) ([Download](https://redis.io/download))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/myntra-ecommerce-backend.git
cd myntra-ecommerce-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start MongoDB (if running locally)
mongod

# 5. Start Redis (optional, for caching)
redis-server

# 6. Run the server
npm run dev     # Development (with nodemon hot-reload)
npm start       # Production
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/myntra_ecommerce` | MongoDB connection string |
| `JWT_SECRET` | — | JWT signing secret (change this!) |
| `JWT_EXPIRE` | `7d` | JWT expiration time |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api`

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | API health check |

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login & get JWT token |
| GET | `/auth/me` | User | Get current user profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Public | List products (paginated + filterable) |
| GET | `/products/search?q=` | Public | Full-text search by name |
| GET | `/products/:id` | Public | Get single product |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

**Query Parameters for listing:**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10)
- `category` — Filter by category (Men, Women, Kids, Beauty, Home, Electronics, Sports, Accessories)
- `minPrice` / `maxPrice` — Price range filter
- `sort` — Sort field (e.g., `price`, `-price`, `-createdAt`)

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | User | Get user's cart |
| POST | `/cart` | User | Add item to cart |
| PUT | `/cart/:itemId` | User | Update item quantity |
| DELETE | `/cart/:itemId` | User | Remove item |
| DELETE | `/cart` | User | Clear entire cart |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payment/process` | User | Process mock payment |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | User | Place order from cart |
| GET | `/orders` | User | Get user's orders |
| GET | `/orders/:id` | User | Get single order |
| GET | `/orders/all` | Admin | Get all orders |
| PUT | `/orders/:id/status` | Admin | Update order status |

---

## 📬 Postman Collection

Import `postman_collection.json` into Postman to test all endpoints.

**Testing Flow:**
1. Register Admin → Register User
2. Login Admin → Login User (tokens auto-saved)
3. Create Products (as Admin)
4. Search & Browse Products
5. Add to Cart (as User)
6. Process Payment
7. Place Order
8. Update Order Status (as Admin)

---

## 🏗️ Architecture Highlights

### Pagination Response Format
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": []
}
```

### Redis Caching Strategy
- Product listings and details are cached with configurable TTL
- Cache auto-invalidates on create/update/delete operations
- **Graceful degradation** — app runs normally without Redis

### Order Status Flow
```
Pending → Shipped → Delivered (one-way, enforced by API)
```

### Security
- Passwords hashed with bcrypt (12 salt rounds)
- JWT token authentication
- Role-based route protection
- Input validation on all endpoints
- HTTP security headers (Helmet)
- Rate limiting (100 req/15min general, 20 req/15min for auth)

---

## 📊 Database Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| users | `{ email: 1 }` unique | Fast login lookup |
| products | `{ category: 1, price: 1 }` | Filtered listing |
| products | `{ name: 'text' }` | Full-text search |
| carts | `{ user: 1 }` unique | One cart per user |
| orders | `{ user: 1, createdAt: -1 }` | Order history |

---

## 📝 License

MIT
