#!/bin/sh

set -e

if [ -z "$DATABASE_URL" ]; then
	echo "ERROR: DATABASE_URL is not set. Set it in Cloud Run (Terraform or deploy workflow). Cannot run migrations or start the app."
	exit 1
fi

echo "Running database migrations..."
npx_prisma_cmd="npx prisma db push --skip-generate"
if [ "${PRISMA_ACCEPT_DATA_LOSS:-false}" = "true" ]; then
	echo "PRISMA_ACCEPT_DATA_LOSS=true -> running prisma with --accept-data-loss"
	npx_prisma_cmd="$npx_prisma_cmd --accept-data-loss"
fi
echo "Running: $npx_prisma_cmd"
sh -c "$npx_prisma_cmd"

echo "Starting application..."

# Start the application directly
# Database migrations are handled by the database-migrations.yml workflow
exec node dist/main.js

