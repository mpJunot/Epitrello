#!/bin/sh

set -e

echo "Running database migrations..."

# Run Prisma migrations
npx prisma db push --skip-generate

echo "Starting application..."

# Start the application
exec node dist/main.js

