#!/bin/bash

# Database Setup Script for DSA Hub
# This script automates the database setup process

echo "🚀 DSA Hub Database Setup"
echo "=========================="
echo ""

# Step 1: Create D1 Database
echo "Step 1: Creating D1 Database..."
echo "Running: npx wrangler d1 create dsa-hub-db"
echo ""

npx wrangler d1 create dsa-hub-db > db-output.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
    echo ""
    
    # Extract database_id from output
    DATABASE_ID=$(grep -oP 'database_id = "\K[^"]+' db-output.txt)
    
    if [ -n "$DATABASE_ID" ]; then
        echo "📝 Database ID: $DATABASE_ID"
        echo ""
        
        # Step 2: Update wrangler.jsonc
        echo "Step 2: Updating wrangler.jsonc..."
        
        # Create backup
        cp wrangler.jsonc wrangler.jsonc.backup
        
        # Update the file
        cat > wrangler.jsonc << EOF
{
  "\$schema": "node_modules/wrangler/config-schema.json",
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
EOF
        
        echo "✅ wrangler.jsonc updated!"
        echo ""
        
        # Step 3: Initialize Schema
        echo "Step 3: Initializing database schema..."
        npx wrangler d1 execute dsa-hub-db --local --file=./schema.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Local database initialized!"
            echo ""
            
            # Also initialize production database
            echo "Initializing production database..."
            npx wrangler d1 execute dsa-hub-db --file=./schema.sql
            
            if [ $? -eq 0 ]; then
                echo "✅ Production database initialized!"
            else
                echo "⚠️  Production database initialization failed (you can do this later)"
            fi
        else
            echo "❌ Schema initialization failed"
            exit 1
        fi
        
        # Cleanup
        rm db-output.txt
        
        echo ""
        echo "🎉 Setup Complete!"
        echo "=================="
        echo ""
        echo "Next steps:"
        echo "1. Run: npm run dev"
        echo "2. Visit: http://localhost:3000"
        echo ""
        echo "Your app now uses Cloudflare D1 database! 🚀"
        
    else
        echo "❌ Could not extract database_id from output"
        cat db-output.txt
        exit 1
    fi
else
    echo "❌ Database creation failed"
    cat db-output.txt
    exit 1
fi
