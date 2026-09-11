# Database Setup Guide

## Using Docker (Recommended - You Have Docker!)

### Prerequisites
✅ Docker Desktop is installed on your system

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** from your Start menu
2. Wait until you see "Docker Desktop is running" in the system tray
3. The whale icon should be steady (not animated)

### Step 2: Start PostgreSQL Database

You have two options:

#### Option A: Use the PowerShell Script (Easiest)
```powershell
# From the project root directory
.\docker-database.ps1 start
```

This script can also:
- `.\docker-database.ps1 stop` - Stop the database
- `.\docker-database.ps1 restart` - Restart the database
- `.\docker-database.ps1 status` - Check if it's running
- `.\docker-database.ps1 logs` - View database logs
- `.\docker-database.ps1 reset` - Reset database (deletes all data)

#### Option B: Manual Docker Command
```powershell
docker run --name taxime-postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=taxime_inventory \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Step 3: Verify Database is Running
```powershell
docker ps
```
You should see `taxime-postgres` in the list with status "Up"

### Step 4: Install Server Dependencies
```powershell
cd server
npm install
```

### Step 5: Generate Prisma Client
```powershell
npm run prisma:generate
```

### Step 6: Run Database Migrations
```powershell
npm run prisma:migrate
```
When prompted for a migration name, you can use: `initial_setup`

### Step 7: Seed the Database with Sample Data
```powershell
npm run prisma:seed
```

You should see output like:
```
🌱 Starting database seeding...
🧹 Cleaning up existing data...
📁 Creating departments...
👥 Creating users...
📦 Creating inventory items...
🚗 Creating vehicles...
✅ Database seeding completed successfully!
```

### Step 8: Start the Backend Server
```powershell
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
📍 Environment: development
📌 Health check: http://localhost:5000/api/health
```

### Step 9: Start the Frontend (New Terminal)
```powershell
cd client
npm install
npm run dev
```

The app will open at: http://localhost:5173

## Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: taxime_inventory
- **Username**: postgres
- **Password**: postgres123

Connection string (already in your .env):
```
postgresql://postgres:postgres123@localhost:5432/taxime_inventory?schema=public
```

## Managing the Database

### View Database in Prisma Studio
```powershell
cd server
npm run prisma:studio
```
Opens a web UI at http://localhost:5555 to view/edit data

### Stop the Database
```powershell
.\docker-database.ps1 stop
# or
docker stop taxime-postgres
```

### Start the Database (After Stopping)
```powershell
.\docker-database.ps1 start
# or
docker start taxime-postgres
```

### Reset Database (Delete All Data)
```powershell
.\docker-database.ps1 reset
# Then re-run migrations and seed:
cd server
npm run prisma:migrate
npm run prisma:seed
```

### Backup Database
```powershell
docker exec taxime-postgres pg_dump -U postgres taxime_inventory > backup.sql
```

### Restore Database
```powershell
docker exec -i taxime-postgres psql -U postgres taxime_inventory < backup.sql
```

## Troubleshooting

### "Port 5432 is already in use"
Another PostgreSQL instance is running. Either:
1. Stop other PostgreSQL instances
2. Use a different port:
   ```powershell
   docker run --name taxime-postgres -p 5433:5432 ...
   # Then update DATABASE_URL in .env to use port 5433
   ```

### "Cannot connect to database"
1. Check Docker Desktop is running
2. Check container is running: `docker ps`
3. Check logs: `docker logs taxime-postgres`
4. Restart container: `docker restart taxime-postgres`

### "Prisma migrate failed"
1. Ensure database is running
2. Check DATABASE_URL in .env is correct
3. Try: `npm run prisma:generate` first

### "Module not found" errors
```powershell
cd server
npm install
npm run prisma:generate
```

## Next Steps

Once the database is set up and seeded:

1. **Test the Backend**:
   - Visit: http://localhost:5000/api/health
   - Should see: `{"success":true,"message":"Taxime API is running"}`

2. **Test the Frontend**:
   - Visit: http://localhost:5173
   - Login with: admin@taxime.com / password123

3. **Explore the System**:
   - Check the seeded data
   - Try different user roles
   - Create requests, approve them, etc.

## Database Schema Overview

The database includes:
- **Users** (with 6 different roles)
- **Departments** (5 departments)
- **Items** (General inventory)
- **Vehicles** (Special inventory items)
- **Clients** (For vehicle sales)
- **Requests** (Inventory requests with approval workflow)
- **Vehicle Sales** (With document uploads)
- **Documents** (File attachments)
- **Notifications** (User notifications)
- **Audit Logs** (System activity tracking)
- **Stock Movements** (Inventory transactions)
- **Suppliers** & **Purchase Orders** (Procurement)

---

Need help? Check the main README.md or SETUP.md files!
