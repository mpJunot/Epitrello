#!/bin/sh

echo "Starting application..."

# Start the application directly
# Database migrations are handled by the database-migrations.yml workflow
exec node dist/main.js

