# RetailHub - E-Commerce Platform

A full-stack e-commerce platform built with React and FastAPI. It handles product browsing, cart management, order tracking, and includes an admin dashboard for store management.

## Features

### For Customers
- Browse products with category filters, search, and sorting
- Shopping cart with persistent storage
- Place orders with Cash on Delivery
- View order history
- User login and registration with JWT authentication
- Works on desktop and mobile

### For Admins
- Dashboard with overview of products, categories, orders, and users
- Add, edit, and delete products
- Manage categories
- Track and update inventory

## Architecture

The platform uses a microservices architecture:

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│                 │     │           Backend Services           │
│   React SPA     │────>│  ┌─────────┐  ┌─────────┐            │
│   (Frontend)    │     │  │  Auth   │  │Products │            │
│                 │     │  └─────────┘  └─────────┘            │
└─────────────────┘     │  ┌──────────┐  ┌─────────┐           │
                        │  │Categories│  │ Orders  │           │
                        │  └──────────┘  └─────────┘           │
                        │  ┌─────────┐  ┌─────────┐            │
                        │  │Inventory│  │ Search  │            │
                        │  └─────────┘  └─────────┘            │
                        └──────────────────────────────────────┘
                                        │
                                        v
                               ┌─────────────────┐
                               │    MongoDB      │
                               └─────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.11 or higher
- MongoDB
- pnpm or npm

### Backend Setup

1. Go to the backend folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. Start the backend:
   ```bash
   python main.py
   ```
   The API runs at `http://localhost:8000`

### Frontend Setup

1. Go to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install  # or npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URLs
   ```

4. Start the development server:
   ```bash
   pnpm start  # or npm start
   ```
   The app runs at `http://localhost:3000`

## API Reference

All endpoints use the `/api` prefix. Protected endpoints require a Bearer token in the Authorization header.

### Authentication Service (/api/auth)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /register | Register a new user | No |
| POST | /login | Login with email and password | No |
| POST | /refresh | Refresh access token | No |
| POST | /logout | Logout user | Yes |
| GET | /me | Get current user profile | Yes |
| GET | /me/cart | Get shopping cart | Yes |
| POST | /me/cart | Add item to cart | Yes |
| PATCH | /me/cart/{product_id} | Update cart item quantity | Yes |
| DELETE | /me/cart/{product_id} | Remove item from cart | Yes |
| DELETE | /me/cart | Clear cart | Yes |

### Products Service (/api/products)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | / | List products (paginated) | No |
| GET | /{product_id} | Get product details | No |
| POST | / | Create product | Admin only |
| PATCH | /{product_id} | Update product | Admin only |
| DELETE | /{product_id} | Delete product | Admin only |

Query parameters for GET /:
- page - Page number (default: 1)
- limit - Items per page (default: 10, max: 100)
- category_id - Filter by category

### Categories Service (/api/categories)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | / | List all categories | No |
| GET | /{category_id} | Get category details | No |
| POST | / | Create category | Admin only |
| PATCH | /{category_id} | Update category | Admin only |
| DELETE | /{category_id} | Delete category | Admin only |

### Orders Service (/api/orders)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | / | List orders (own for users, all for admins) | Yes |
| GET | /{order_id} | Get order details | Yes |
| POST | / | Create order | Yes |
| POST | /{order_id}/reorder | Reorder from previous order | Yes |

Query parameters for GET /:
- page - Page number (default: 1)
- limit - Items per page (default: 10, max: 100)

### Inventory Service (/api/inventory)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | / | Get all stock levels | Admin only |
| PATCH | /{product_id} | Update stock | Admin only |

### Search Service (/api/search)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | / | Search products | No |

Query parameters:
- q - Search query (searches title and description)

## Authentication

The platform uses JWT tokens:

- Access Token: Valid for 15 minutes, used for API requests
- Refresh Token: Valid for 7 days, used to get new access tokens

Login response example:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

## Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- Axios
- Context API

### Backend
- FastAPI
- PyMongo
- Pydantic
- Python-Jose
- Uvicorn

### Database
- MongoDB

### Deployment
- Vercel for frontend
- Railway for backend services

## Project Structure

```
Ecommerse/
├── frontend/                 # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # API client configuration
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin panel pages
│   │   └── App.js           # Main app component
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── app/                 # Main app configuration
│   ├── common/              # Shared utilities
│   │   ├── auth_middleware.py
│   │   ├── database.py
│   │   └── security.py
│   ├── services/            # Microservices
│   │   ├── auth/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── inventory/
│   │   └── search/
│   ├── main.py              # Entry point
│   └── requirements.txt
│
└── README.md
```

## Authors

- Aditya Pratap Singh
- Sunil Saini
- Akash Kumar

---

Built for HCL Hackathon 2026
