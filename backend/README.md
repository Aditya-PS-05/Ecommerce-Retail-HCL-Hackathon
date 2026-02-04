# Retail Portal Backend - Microservices Architecture

A FastAPI-based microservices backend for an e-commerce retail portal, deployed on Railway.

## Architecture

The backend consists of 6 independent microservices:

| Service | Port | Description |
|---------|------|-------------|
| Auth | 8001 | User authentication (JWT) |
| Products | 8002 | Product catalog management |
| Categories | 8003 | Category management |
| Inventory | 8004 | Stock level management |
| Orders | 8005 | Order processing |
| Search | 8006 | Product search |

## Live Endpoints

| Service | URL |
|---------|-----|
| Auth | https://ecommerce-retail-hcl-hackathon-production.up.railway.app/api/auth/ |
| Products | https://daring-gentleness-production-c73c.up.railway.app/api/products |
| Categories | https://gentle-mindfulness-production.up.railway.app/api/ |
| Inventory | https://nurturing-acceptance-production-a15c.up.railway.app/api |
| Orders | https://lavish-magic-production.up.railway.app |

## Tech Stack

- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcrypt

## Local Development

### Prerequisites

- Python 3.11+
- MongoDB instance
- uv (package manager)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   uv sync
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. Run a specific service:
   ```bash
   # Auth service
   cd services/auth && uvicorn app.main:app --port 8001 --reload
   
   # Products service
   cd services/products && uvicorn app.main:app --port 8002 --reload
   ```

5. Or run all services:
   ```bash
   ./run_all_services.sh
   ```

## API Documentation

Each service provides Swagger UI documentation:
- Auth: `/docs`
- Products: `/docs`
- etc.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET_KEY` | Secret for JWT signing |
| `JWT_ALGORITHM` | JWT algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (default: 30) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry (default: 7) |

## API Endpoints

### Auth Service
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Products Service
- `GET /api/products` - List products (paginated)
- `GET /api/products/{id}` - Get product
- `POST /api/products` - Create product (Admin)
- `PATCH /api/products/{id}` - Update product (Admin)
- `DELETE /api/products/{id}` - Delete product (Admin)
- `POST /api/products/{id}/upload-image` - Upload image (Admin)

### Categories Service
- `GET /api/categories` - List categories
- `GET /api/categories/{id}` - Get category
- `POST /api/categories` - Create category (Admin)
- `PATCH /api/categories/{id}` - Update category (Admin)
- `DELETE /api/categories/{id}` - Delete category (Admin)

### Inventory Service
- `GET /api/inventory` - Get stock levels (Admin)
- `PATCH /api/inventory/{product_id}` - Update stock (Admin)

### Orders Service
- `GET /api/orders` - Get orders
- `GET /api/orders/{id}` - Get order
- `POST /api/orders` - Create order
- `POST /api/orders/{id}/reorder` - Quick reorder

### Search Service
- `GET /api/search?q=query` - Search products

## Error Response Format

All errors follow this format:
```json
{
  "status_code": 400,
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid email format"
}
```

## Deployment

The services are deployed to Railway. Each service has its own Railway project with:
- Nixpacks build configuration
- Environment variables configured via Railway dashboard
