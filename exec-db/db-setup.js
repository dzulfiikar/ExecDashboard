db = db.getSiblingDB('analyticsdb');

db.createUser({
  user: "analyticsuser",
  pwd: "analyticspass",
  roles: [
    {
      role: "readWrite",
      db: "analyticsdb"
    }
  ]
});

print("Database user created successfully!");