// Promote a user to ADMIN (or STAFF).
// Usage:  node src/makeAdmin.js you@example.com [ADMIN|STAFF]
import { sequelize } from "./db/index.js";
import "./models/relation.js";
import User from "./models/users.model.js";

const [, , email, role = "ADMIN"] = process.argv;

if (!email) {
  console.error("Usage: node src/makeAdmin.js <email> [ADMIN|STAFF]");
  process.exit(1);
}

try {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }
  user.role = role.toUpperCase();
  await user.save();
  console.log(`${email} is now ${user.role}`);
  process.exit(0);
} catch (err) {
  console.error("Failed:", err);
  process.exit(1);
}
