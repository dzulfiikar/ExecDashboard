#!/bin/bash
set -e

echo "Waiting for MongoDB to be ready..."
until mongosh --host ${MONGO_HOST:-exec-db} --eval "print(\"waited for connection\")"
do
    sleep 2
done

echo "Setting up database..."
mongosh --host ${MONGO_HOST:-exec-db} < /tmp/db-setup.js

echo "Database setup completed!"