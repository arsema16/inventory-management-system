# Quick Setup Guide

## Prerequisites
- Node.js 18+ and npm installed
- PostgreSQL 14+ installed and running
- Git installed

## Quick Start (5 minutes)

### 1. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE taxime_inventory;
```

### 2. Backend Setup
```bash
cd server
npm install
```

Update `server/.env` with your database credentials:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/taxime_inventory?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

Run migrations and seed:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start backend:
```bash
npm run dev
```
Backend will run on: http://localhost:5000

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

### 4. Login
Open http://localhost:5173 and login with:
- **Email:** admin@taxime.com
- **Password:** password123

## Test Accounts

| Role | Email | Password | Can Do |
|------|-------|----------|--------|
| Admin | admin@taxime.com | password123 | Everything |
| Operations Manager | ops@taxime.com | password123 | Approve requests & sales |
| Finance | finance@taxime.com | password123 | Create vehicle sales, upload documents |
| Storekeeper | store@taxime.com | password123 | Manage inventory, fulfill requests |
| Employee | employee@taxime.com | password123 | Create requests, view inventory |

## Features to Test

### As Employee
1. View inventory items
2. Create a new request for items
3. View your requests

### As Operations Manager
1. Go to Approval Center
2. Approve/reject pending requests
3. Approve/reject vehicle sales

### As Finance
1. Go to Vehicle Sales
2. Create a new sale
3. Upload documents for a sale

### As Storekeeper
1. Go to Inventory
2. Add new items
3. Fulfill approved requests

### As Admin
1. Access all modules
2. Manage users and departments
3. View audit logs

## Troubleshooting

### Port Already in Use
If ports 5000 or 5173 are in use:
- Backend: Change `PORT` in `server/.env`
- Frontend: Vite will automatically use a different port

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `server/.env`
- Ensure database exists

### Prisma Client Error
Run:
```bash
cd server
npm run prisma:generate
```

## Project Structure Overview

```
inventory-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # Auth context
│   │   └── utils/         # Helper functions
│
└── server/                # Express backend
    ├── src/
    │   ├── routes/        # API endpoints
    │   ├── controllers/   # Request handlers
    │   ├── services/      # Business logic
    │   └── middleware/    # Auth, uploads, etc.
    └── prisma/
        └── schema.prisma  # Database schema
```

## Next Steps

1. **Explore the system** - Login with different roles
2. **Test workflows** - Create requests, approve them, fulfill them
3. **Customize** - Modify according to your needs
4. **Deploy** - Follow deployment guide in README.md

## Need Help?

Check the main [README.md](./README.md) for:
- Detailed API documentation
- Deployment instructions
- Security considerations
- Contributing guidelines

---

Happy coding! 🚀
