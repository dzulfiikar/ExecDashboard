#!/bin/bash
set -euo pipefail

MONGO_HOST=${MONGO_HOST:-exec-db}
SCRIPT_PATH=${SCRIPT_PATH:-/tmp/seed-proper-data.js}

echo "Waiting for MongoDB at ${MONGO_HOST}..."
until mongosh --host "${MONGO_HOST}" --quiet --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null; do
  sleep 2
done

echo "Seeding proper demo data..."
mongosh --host "${MONGO_HOST}" --quiet "${SCRIPT_PATH}"
echo "Proper demo data seed completed."
