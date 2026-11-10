#!/bin/sh
echo "Running database migrations..."
npx prisma db push --skip-generate 2>&1 || echo "Migration warning"
echo "Starting DentalSix..."
exec node server.js
