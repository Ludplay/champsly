#!/bin/sh

echo "Running migrations..."
docker compose exec truco-platform-backend npm run migrate