# KV Audio - Backend API

A robust and scalable RESTful API backend for KV Audio, a modern e-commerce platform specializing in professional audio equipment rentals and sales.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication & Authorization](#authentication--authorization)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## 🎯 Overview

The KV Audio Backend is a Node.js/Express-based REST API that powers the KV Audio platform. It provides comprehensive functionality for managing audio equipment inventory, processing customer orders, handling user authentication, managing customer reviews, and facilitating customer inquiries.

## ✨ Features

### User Management
- ✅ User registration and authentication
- ✅ JWT-based authorization
- ✅ Role-based access control (Admin/Customer)
- ✅ Google OAuth integration
- ✅ Email verification with OTP
- ✅ User blocking/unblocking capabilities
- ✅ Profile management with avatar support

### Product Management
- ✅ CRUD operations for audio equipment
- ✅ Product categorization
- ✅ Multi-image support
- ✅ Availability tracking
- ✅ Admin-only product modifications

### Order Management
- ✅ Rental order creation and tracking
- ✅ Order approval workflow
- ✅ Date-based rental periods
- ✅ Order status management
- ✅ Total amount calculation

### Review System
- ✅ Customer review submission
- ✅ Rating system (1-5 stars)
- ✅ Admin approval workflow
- ✅ Profile picture integration

### Customer Support
- ✅ Inquiry submission system
- ✅ Admin response management
- ✅ Resolution tracking
- ✅ Auto-incrementing inquiry IDs

---

## 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email service |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |
| **Axios** | HTTP client for external APIs |
| **Nodemon** | Development auto-restart |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Gmail account for email services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kv-audio-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### API Endpoints

#### **Users** (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/google-login` | Google OAuth login | No |
| POST | `/send-otp` | Send OTP for verification | No |
| POST | `/verify-otp` | Verify OTP code | No |
| GET | `/` | Get all users | Admin |
| GET | `/:email` | Get user by email | Yes |
| PUT | `/block/:email` | Block/unblock user | Admin |

#### **Products** (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Add new product | Admin |
| GET | `/` | Get all products | No |
| GET | `/:key` | Get product by key | No |
| PUT | `/:key` | Update product | Admin |
| DELETE | `/:key` | Delete product | Admin |

#### **Reviews** (`/api/reviews`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Submit review | Customer |
| GET | `/` | Get all reviews | No |
| GET | `/approved` | Get approved reviews | No |
| PUT | `/:email` | Update review approval | Admin |
| DELETE | `/:email` | Delete review | Admin |

#### **Orders** (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create order | Customer |
| GET | `/` | Get all orders | Admin |
| GET | `/:orderId` | Get order by ID | Yes |
| GET | `/user/:email` | Get user orders | Customer |
| PUT | `/:orderId` | Update order | Admin |
| DELETE | `/:orderId` | Delete order | Admin |

#### **Inquiries** (`/api/inquiries`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Submit inquiry | No |
| GET | `/` | Get all inquiries | Admin |
| GET | `/:id` | Get inquiry by ID | Admin |
| PUT | `/:id` | Update inquiry | Admin |
| DELETE | `/:id` | Delete inquiry | Admin |

---

## 🗄 Database Models

### User Schema
```javascript
{
  email: String (unique, required),
  password: String (required, hashed),
  role: String (default: "Customer"),
  firstName: String (required),
  lastName: String (required),
  address: String (required),
  phone: String (required),
  isBlocked: Boolean (default: false),
  profilePicture: String (default: avatar URL),
  emailVerified: Boolean (default: false)
}
```

### Product Schema
```javascript
{
  key: String (unique, required),
  name: String (required),
  price: Number (required),
  category: String (default: "uncategorized"),
  dimensions: String (required),
  description: String (required),
  availability: Boolean (default: true),
  image: [String] (required)
}
```

### Order Schema
```javascript
{
  orderId: String (unique, required),
  email: String (required),
  orderDate: Date (default: now),
  orderedItems: [Product Details],
  days: Number (required),
  startingDate: Date (required),
  endingDate: Date (required),
  isApproved: Boolean (default: false),
  status: String (default: "pending"),
  totalAmount: Number (required, min: 0)
}
```

### Review Schema
```javascript
{
  email: String (unique, required),
  name: String (required),
  rating: Number (required),
  comment: String (required),
  date: Date (default: now),
  profilePicture: String (default: avatar URL),
  isApproved: Boolean (default: false)
}
```

### Inquiry Schema
```javascript
{
  id: Number (unique, required),
  email: String (required),
  message: String (required),
  createdAt: Date (default: now),
  phone: String (optional),
  response: String (default: ""),
  isResolved: Boolean (default: false)
}
```

---

## 🔐 Authentication & Authorization

### JWT Implementation

The API uses JSON Web Tokens (JWT) for authentication:

1. **Token Generation**: Upon successful login, a JWT token is generated and sent to the client
2. **Token Verification**: Protected routes verify the token from the `Authorization` header
3. **Role-Based Access**: Admin and Customer roles determine access to specific endpoints

### Usage

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Middleware

The global authentication middleware extracts and verifies the JWT token from requests:
```javascript
// Automatically decodes and attaches user info to req.user
req.user = {
  email: "user@example.com",
  role: "Customer" | "Admin"
}
```

---

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | `app-specific-password` |

> **Note**: For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

---

## 📁 Project Structure

```
kv-audio-backend/
├── controllers/          # Business logic handlers
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── reviewController.js
│   └── inquiryController.js
├── models/              # Mongoose schemas
│   ├── user.js
│   ├── product.js
│   ├── order.js
│   ├── review.js
│   ├── inquiry.js
│   └── otp.js
├── routes/              # API route definitions
│   ├── userRouter.js
│   ├── productRouter.js
│   ├── orderRouter.js
│   ├── reviewRouter.js
│   └── inquiryRouter.js
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── index.js            # Application entry point
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

---

## 🧪 Development

### Running in Development Mode

```bash
npm start
```

This uses `nodemon` to automatically restart the server on file changes.

### Testing the API

You can test the API using:
- **Postman**: Import the endpoints and test each route
- **cURL**: Command-line HTTP requests
- **Thunder Client**: VS Code extension for API testing

### Example Request

```bash
# Login example
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Support

For support or inquiries, please contact the development team or submit an inquiry through the platform.

---

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and management
  - Product catalog management
  - Order processing system
  - Review and inquiry systems

---

**Built with ❤️ by the KV Audio Development Team**
