#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
until mongo --host ${MONGO_HOST:-exec-db} --eval "print(\"waited for connection\")"
do
    sleep 2
done

echo "Setting up database..."
mongo --host ${MONGO_HOST:-exec-db} < /tmp/db-setup.js

echo "Database setup completed!"