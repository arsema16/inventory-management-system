# 🚀 Quick Start Checklist

Follow these steps in order to get the Taxime system running:

## ✅ Setup Checklist

### 1. Start Docker Desktop
- [ ] Open Docker Desktop from Start menu
- [ ] Wait for "Docker Desktop is running" in system tray
- [ ] Whale icon should be steady (not animated)

### 2. Start PostgreSQL Database
```powershell
.\docker-database.ps1 start
```
- [ ] You should see "✅ Database created and started!"
- [ ] Run `docker ps` to verify it's running

### 3. Install Server Dependencies
```powershell
cd server
npm install
```
- [ ] Wait for installation to complete (may take 1-2 minutes)

### 4. Setup Database Schema
```powershell
# Still in server directory
npm run prisma:generate
npm run prisma:migrate
```
- [ ] When asked for migration name, type: `initial_setup`
- [ ] You should see "Your database is now in sync"

### 5. Seed Database with Sample Data
```powershell
npm run prisma:seed
```
- [ ] You should see departments, users, items, vehicles created
- [ ] Note the login credentials shown at the end

### 6. Start Backend Server
```powershell
npm run dev
```
- [ ] You should see "🚀 Server is running on port 5000"
- [ ] Keep this terminal open!

### 7. Install Frontend Dependencies (New Terminal)
```powershell
cd client
npm install
```
- [ ] Wait for installation to complete

### 8. Start Frontend
```powershell
npm run dev
```
- [ ] You should see "Local: http://localhost:5173"
- [ ] Browser should open automatically

### 9. Test the Application
- [ ] Open http://localhost:5173
- [ ] Login with: **admin@taxime.com** / **password123**
- [ ] You should see the dashboard!

## 🎉 Success!

If you completed all steps, you should now have:
- ✅ PostgreSQL database running in Docker
- ✅ Backend API running on http://localhost:5000
- ✅ Frontend app running on http://localhost:5173
- ✅ 5 test accounts ready to use
- ✅ Sample data loaded (inventory, vehicles, requests)

## 🧪 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@taxime.com | password123 | Admin |
| ops@taxime.com | password123 | Operations Manager |
| finance@taxime.com | password123 | Finance |
| store@taxime.com | password123 | Storekeeper |
| employee@taxime.com | password123 | Employee |

## 🔧 Common Issues

### Database won't start?
```powershell
# Check Docker Desktop is running
docker ps

# Try restarting
.\docker-database.ps1 restart
```

### Port 5000 already in use?
Change `PORT=5001` in `server/.env`

### Frontend won't start?
Delete `node_modules` and try again:
```powershell
cd client
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Can't login?
Make sure:
1. Backend is running (check http://localhost:5000/api/health)
2. Database is running (`docker ps`)
3. Seed was successful

## 📚 Next Steps

1. **Explore as Admin**:
   - View all inventory items
   - Check vehicle list
   - Review pending requests

2. **Test as Operations Manager**:
   - Logout and login as ops@taxime.com
   - Go to Approval Center
   - Approve/reject requests

3. **Try as Employee**:
   - Logout and login as employee@taxime.com
   - Create a new request
   - View inventory

## 🛑 Stopping Everything

When you're done:
```powershell
# Stop frontend (Ctrl+C in frontend terminal)
# Stop backend (Ctrl+C in backend terminal)

# Stop database
.\docker-database.ps1 stop
```

## 🔄 Starting Again Later

```powershell
# Start database
.\docker-database.ps1 start

# Start backend (in server directory)
npm run dev

# Start frontend (in client directory)
npm run dev
```

---

🎯 **Goal**: All checkboxes checked = System fully running!

Need detailed help? See DATABASE-SETUP.md or README.md
