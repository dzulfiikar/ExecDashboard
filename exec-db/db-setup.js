db = db.getSiblingDB('analyticsdb');

try {
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
} catch (e) {
  if (e.code === 51003) {
    print("User already exists, skipping.");
  } else {
    throw e;
  }
}
