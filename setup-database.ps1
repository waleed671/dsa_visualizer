# Database Setup Script for DSA Hub (PowerShell)
# This script automates the database setup process

Write-Host "🚀 DSA Hub Database Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create D1 Database
Write-Host "Step 1: Creating D1 Database..." -ForegroundColor Yellow
Write-Host "Running: npx wrangler d1 create dsa-hub-db" -ForegroundColor Gray
Write-Host ""

$output = npx wrangler d1 create dsa-hub-db 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Extract database_id from output
    if ($output -match 'database_id = "([^"]+)"') {
        $DATABASE_ID = $matches[1]
        Write-Host "📝 Database ID: $DATABASE_ID" -ForegroundColor Cyan
        Write-Host ""
        
        # Step 2: Update wrangler.jsonc
        Write-Host "Step 2: Updating wrangler.jsonc..." -ForegroundColor Yellow
        
        # Create backup
        Copy-Item wrangler.jsonc wrangler.jsonc.backup -Force
        
        # Update the file
        $config = @"
{
  "`$schema": "node_modules/wrangler/config-schema.json",
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "dsa-hub-db",
      "database_id": "$DATABASE_ID"
    }
  ]
}
"@
        
        $config | Out-File -FilePath wrangler.jsonc -Encoding UTF8
        
        Write-Host "✅ wrangler.jsonc updated!" -ForegroundColor Green
        Write-Host ""
        
        # Step 3: Initialize Schema
        Write-Host "Step 3: Initializing database schema..." -ForegroundColor Yellow
        npx wrangler d1 execute dsa-hub-db --local --file=./schema.sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Local database initialized!" -ForegroundColor Green
            Write-Host ""
            
            # Also initialize production database
            Write-Host "Initializing production database..." -ForegroundColor Yellow
            npx wrangler d1 execute dsa-hub-db --file=./schema.sql
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Production database initialized!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Production database initialization failed (you can do this later)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Schema initialization failed" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "🎉 Setup Complete!" -ForegroundColor Green
        Write-Host "==================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: npm run dev" -ForegroundColor White
        Write-Host "2. Visit: http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Your app now uses Cloudflare D1 database! 🚀" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Could not extract database_id from output" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
} else {
    Write-Host "❌ Database creation failed" -ForegroundColor Red
    Write-Host $output
    
    if ($output -match "request_forbidden" -or $output -match "login") {
        Write-Host ""
        Write-Host "⚠️  You need to login to Cloudflare first!" -ForegroundColor Yellow
        Write-Host "Run: npx wrangler login" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then run this script again." -ForegroundColor White
    }
    
    exit 1
}
