# Taxime Inventory Management System

A comprehensive web-based inventory management system built for managing inventory, vehicles, requests, approvals, and vehicle sales.

## 🌟 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Inventory Management** - Track items with SKU, quantity, status, and location
- **Vehicle Management** - Specialized tracking for vehicles with VIN, mileage, and pricing
- **Request System** - Create and track inventory requests with approval workflow
- **Vehicle Sales** - Complete sales process with client management and document uploads
- **Approval Center** - Centralized approval interface for managers
- **Document Management** - Upload and manage legal documents for vehicle sales
- **Notifications** - Real-time notifications for important events
- **Audit Logs** - Complete audit trail of all system activities

### User Roles
- **Admin** - Full system access
- **Operations Manager** - Approve requests and sales
- **Finance** - Manage vehicle sales and upload documents
- **Storekeeper** - Manage inventory and fulfill requests
- **Procurement** - Handle purchasing and suppliers
- **Employee** - Create requests and view inventory

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Frontend
- **React 19** with **TypeScript**
- **React Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Vite** for fast development

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env example and update with your values
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/taxime_inventory?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
UPLOAD_DIR="uploads"
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Seed the database with sample data:
```bash
npm run prisma:seed
```

7. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env example
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔑 Default Login Credentials

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taxime.com | password123 |
| Operations Manager | ops@taxime.com | password123 |
| Finance | finance@taxime.com | password123 |
| Storekeeper | store@taxime.com | password123 |
| Employee | employee@taxime.com | password123 |

## 📁 Project Structure

```
inventory-management-system/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── prisma/
    │   ├── schema.prisma  # Database schema
    │   └── seed.ts        # Database seeder
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── middleware/    # Express middleware
    │   ├── routes/        # API routes
    │   ├── services/      # Business logic
    │   ├── types/         # TypeScript types
    │   └── utils/         # Utility functions
    └── package.json
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code:
```bash
cd server
npm run build
```

2. Set production environment variables
3. Run migrations on production database
4. Start the server:
```bash
npm start
```

### Frontend Deployment
1. Build the React app:
```bash
cd client
npm run build
```

2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## 📚 API Documentation

API endpoints are organized by resource:

- `/api/auth` - Authentication (login, register)
- `/api/users` - User management
- `/api/departments` - Department management
- `/api/items` - Inventory items
- `/api/vehicles` - Vehicle management
- `/api/requests` - Request creation and approval
- `/api/sales` - Vehicle sales
- `/api/documents` - Document upload/download
- `/api/notifications` - User notifications

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- File upload validation
- SQL injection protection (Prisma)
- XSS protection
- CORS configuration

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding unit and integration tests
- Implementing rate limiting
- Adding API documentation (Swagger/OpenAPI)
- Setting up CI/CD pipeline
- Adding monitoring and logging
- Implementing backup strategies

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Development

### Running Database Migrations
```bash
cd server
npm run prisma:migrate
```

### Viewing Database
```bash
cd server
npm run prisma:studio
```

### Linting (Frontend)
```bash
cd client
npm run lint
```

---

Built with ❤️ for efficient inventory and vehicle management.
