# 🛒 RetailHub - E-Commerce Platform

A modern, full-stack e-commerce platform built with React and FastAPI microservices. RetailHub provides a seamless shopping experience with features like product browsing, cart management, order tracking, and an admin dashboard for store management.

![RetailHub](https://img.shields.io/badge/RetailHub-E--Commerce-red)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)

## 🌟 Features

### Customer Features
- **Product Browsing** - Browse products with filtering by category, search, and sorting
- **Shopping Cart** - Add/remove items, update quantities, persistent cart
- **Order Management** - Place orders with Cash on Delivery, view order history
- **User Authentication** - Secure login/register with JWT tokens
- **Responsive Design** - Works seamlessly on desktop and mobile

### Admin Features
- **Dashboard** - Overview of products, categories, orders, and users
- **Product Management** - Create, edit, and delete products
- **Category Management** - Organize products into categories
- **Inventory Tracking** - Monitor and update stock levels

## 🏗️ Architecture

RetailHub uses a **microservices architecture** with the following services:

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│                 │     │           Backend Services           │
│   React SPA     │────▶│  ┌─────────┐  ┌─────────┐            │
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
                                        ▼
                               ┌─────────────────┐
                               │    MongoDB      │
                               └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. Run the backend:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install  # or npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URLs
   ```

4. Start the development server:
   ```bash
   pnpm start  # or npm start
   ```
   The app will be available at `http://localhost:3000`

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication required endpoints need a `Bearer` token in the `Authorization` header.

### Authentication Service (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login with email/password | ❌ |
| POST | `/refresh` | Refresh access token | ❌ |
| POST | `/logout` | Logout user | ✅ |
| GET | `/me` | Get current user profile | ✅ |
| GET | `/me/cart` | Get user's shopping cart | ✅ |
| POST | `/me/cart` | Add item to cart | ✅ |
| PATCH | `/me/cart/{product_id}` | Update cart item quantity | ✅ |
| DELETE | `/me/cart/{product_id}` | Remove item from cart | ✅ |
| DELETE | `/me/cart` | Clear entire cart | ✅ |

### Products Service (`/api/products`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List products (paginated) | ❌ |
| GET | `/{product_id}` | Get product details | ❌ |
| POST | `/` | Create new product | 🔒 Admin |
| PATCH | `/{product_id}` | Update product | 🔒 Admin |
| DELETE | `/{product_id}` | Delete product | 🔒 Admin |

**Query Parameters for GET `/`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `category_id` - Filter by category

### Categories Service (`/api/categories`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all categories | ❌ |
| GET | `/{category_id}` | Get category details | ❌ |
| POST | `/` | Create new category | 🔒 Admin |
| PATCH | `/{category_id}` | Update category | 🔒 Admin |
| DELETE | `/{category_id}` | Delete category | 🔒 Admin |

### Orders Service (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List orders (users: own, admins: all) | ✅ |
| GET | `/{order_id}` | Get order details | ✅ |
| POST | `/` | Create new order | ✅ |
| POST | `/{order_id}/reorder` | Reorder from previous order | ✅ |

**Query Parameters for GET `/`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Inventory Service (`/api/inventory`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all product stock levels | 🔒 Admin |
| PATCH | `/{product_id}` | Update product stock | 🔒 Admin |

### Search Service (`/api/search`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Search products | ❌ |

**Query Parameters:**
- `q` - Search query (searches title, description)

## 🔐 Authentication

RetailHub uses JWT (JSON Web Tokens) for authentication:

1. **Access Token** - Short-lived token (15 minutes) for API requests
2. **Refresh Token** - Long-lived token (7 days) to obtain new access tokens

### Login Response Example
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

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **FastAPI** - Python web framework
- **PyMongo** - MongoDB driver
- **Pydantic** - Data validation
- **Python-Jose** - JWT handling
- **Uvicorn** - ASGI server

### Database
- **MongoDB** - NoSQL database

### Deployment
- **Vercel** - Frontend hosting
- **Railway** - Backend microservices hosting

## 📁 Project Structure

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Aditya** - *Initial work*

---

Built with ❤️ for HCL Hackathon 2026
