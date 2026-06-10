#!/bin/sh
set -e

# The database is already up: docker compose only starts this container once
# the db service healthcheck (pg_isready) passes. Apply pending migrations,
# then hand off to the Next.js standalone server.

echo "Running prisma migrate deploy..."
cd /opt/prisma
./node_modules/.bin/prisma migrate deploy

echo "Starting Next.js server..."
cd /app
exec node server.js
