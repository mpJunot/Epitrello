#!/bin/sh

set -e

echo "Running database migrations..."

# Run Prisma migrations
npx_prisma_cmd="npx prisma db push --skip-generate"
if [ "${PRISMA_ACCEPT_DATA_LOSS:-false}" = "true" ]; then
	echo "PRISMA_ACCEPT_DATA_LOSS=true -> running prisma with --accept-data-loss"
	npx_prisma_cmd="$npx_prisma_cmd --accept-data-loss"
fi

echo "Running: $npx_prisma_cmd"
sh -c "$npx_prisma_cmd"

echo "Starting application..."

# Start the application
exec node dist/main.js

