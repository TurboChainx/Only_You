#!/bin/bash
cd /var/www/onlyyou/backend
node -e '
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}, {projection: {email: 1, phone: 1, fullName: 1}}).toArray();
  console.log("=== All Users ===");
  users.forEach(u => console.log(u.email, "-", u.phone, "-", u.fullName));
  console.log("Total:", users.length);
  process.exit(0);
});
'
