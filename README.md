# ANSAC API - Psychological Testing Platform

A RESTful API backend for the ANSAC psychological testing platform, built with Express.js and Prisma ORM.

## Features

- User authentication and authorization
- User profile management
- Psychological test administration and scoring
- Blog post management
- Gallery management
- FAQ system
- Services listing
- Comprehensive API documentation

## Technology Stack

- Node.js & Express.js
- Prisma ORM with PostgreSQL
- JWT for authentication
- Express Validator for input validation
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-ansac
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## API Structure

The API follows a modular architecture with proper versioning:

```
/api/v1/auth        - Authentication endpoints
/api/v1/user        - User management
/api/v1/admin       - Admin operations
/api/v1/test        - Psychological tests
/api/v1/blog        - Blog management
/api/v1/gallery     - Gallery management
/api/v1/faq         - FAQ system
/api/v1/service     - Services management
```

Additional utility endpoints:
```
/health            - API health check
/api-docs          - API documentation
```

## Project Structure

```
express-ansac/
├── src/                         # Source code
│   ├── api/                     # API modules
│   │   └── v1/                  # API version 1
│   │       ├── controllers/     # Request handlers
│   │       ├── routes/          # Route definitions
│   │       └── validators/      # Input validation
│   ├── config/                  # Configuration files
│   ├── services/                # Business logic
│   ├── shared/                  # Shared utilities
│   │   ├── controllers/         # Base controllers
│   │   ├── middlewares/         # Middleware functions
│   │   └── utils/               # Utility functions
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── prisma/                      # Database schema and migrations
├── public/                      # Static files
│   └── uploads/                 # Uploaded files
├── postman/                     # Postman collection and environment
├── .env                         # Environment variables
└── package.json                 # Project dependencies
```

## Documentation

For detailed API documentation, refer to the:

- [Postman Collection](postman/ANSAC-API.postman_collection.json)
- [Postman Testing Guide](postman/README.md)
- API documentation endpoint: `/api-docs`

## Running in Production

For production deployment:

1. Set environment variables:
```
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
```

2. Build and start the application:
```bash
npm run build
npm start
```

## License

[MIT](LICENSE)