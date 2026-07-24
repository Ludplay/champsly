#!/bin/sh

echo "Running migrations..."
docker compose exec champsly-backend npm run migrate