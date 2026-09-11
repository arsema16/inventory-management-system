# Docker PostgreSQL Management Script for Taxime

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'reset')]
    [string]$action = 'status'
)

$containerName = "taxime-postgres"

function Show-Status {
    Write-Host "`n📊 Database Status:" -ForegroundColor Cyan
    docker ps -a --filter "name=$containerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

function Start-Database {
    Write-Host "`n🚀 Starting PostgreSQL database..." -ForegroundColor Green
    
    # Check if container exists
    $exists = docker ps -a --filter "name=$containerName" --format "{{.Names}}"
    
    if ($exists) {
        docker start $containerName
        Write-Host "✅ Database started!" -ForegroundColor Green
    } else {
        Write-Host "📦 Creating new database container..." -ForegroundColor Yellow
        docker run --name $containerName `
            -e POSTGRES_PASSWORD=postgres123 `
            -e POSTGRES_DB=taxime_inventory `
            -p 5432:5432 `
            -d postgres:16-alpine
        Write-Host "✅ Database created and started!" -ForegroundColor Green
    }
    
    Show-Status
}

function Stop-Database {
    Write-Host "`n🛑 Stopping PostgreSQL database..." -ForegroundColor Yellow
    docker stop $containerName
    Write-Host "✅ Database stopped!" -ForegroundColor Green
    Show-Status
}

function Restart-Database {
    Write-Host "`n🔄 Restarting PostgreSQL database..." -ForegroundColor Yellow
    docker restart $containerName
    Write-Host "✅ Database restarted!" -ForegroundColor Green
    Show-Status
}

function Show-Logs {
    Write-Host "`n📋 Database Logs (last 50 lines):" -ForegroundColor Cyan
    docker logs --tail 50 $containerName
}

function Reset-Database {
    Write-Host "`n⚠️  WARNING: This will delete ALL data!" -ForegroundColor Red
    $confirm = Read-Host "Type 'YES' to confirm"
    
    if ($confirm -eq 'YES') {
        Write-Host "`n🗑️  Removing old container..." -ForegroundColor Yellow
        docker stop $containerName 2>$null
        docker rm $containerName 2>$null
        
        Write-Host "📦 Creating fresh database..." -ForegroundColor Yellow
        docker run --name $containerName `
            -e POSTGRES_PASSWORD=postgres123 `
            -e POSTGRES_DB=taxime_inventory `
            -p 5432:5432 `
            -d postgres:16-alpine
            
        Write-Host "✅ Database reset complete!" -ForegroundColor Green
        Write-Host "`n⚠️  Don't forget to run migrations and seed:" -ForegroundColor Yellow
        Write-Host "   cd server" -ForegroundColor White
        Write-Host "   npm run prisma:migrate" -ForegroundColor White
        Write-Host "   npm run prisma:seed" -ForegroundColor White
    } else {
        Write-Host "❌ Reset cancelled" -ForegroundColor Red
    }
}

# Main logic
switch ($action) {
    'start' { Start-Database }
    'stop' { Stop-Database }
    'restart' { Restart-Database }
    'status' { Show-Status }
    'logs' { Show-Logs }
    'reset' { Reset-Database }
}

Write-Host "`n📚 Available commands:" -ForegroundColor Cyan
Write-Host "   .\docker-database.ps1 start   - Start the database" -ForegroundColor White
Write-Host "   .\docker-database.ps1 stop    - Stop the database" -ForegroundColor White
Write-Host "   .\docker-database.ps1 restart - Restart the database" -ForegroundColor White
Write-Host "   .\docker-database.ps1 status  - Check database status" -ForegroundColor White
Write-Host "   .\docker-database.ps1 logs    - View database logs" -ForegroundColor White
Write-Host "   .\docker-database.ps1 reset   - Reset database (delete all data)" -ForegroundColor White
Write-Host ""
