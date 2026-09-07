// One-off idempotent migration for columns that sequelize.sync({ alter:true })
// can't add cleanly to a table that already has rows (NOT NULL without a default).
// Safe to run repeatedly.
import { sequelize } from "./db/index.js";

const stmts = [
  "ALTER TABLE `orders` ADD COLUMN `subtotal_amount` DECIMAL(12,2) NOT NULL DEFAULT 0",
  "ALTER TABLE `orders` ADD COLUMN `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0",
  "ALTER TABLE `orders` ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
  // Guest checkout: orders can be placed without an account.
  "ALTER TABLE `orders` ADD COLUMN `guest_email` VARCHAR(150) NULL",
  // Keep the exact charset/collation of users.id or the FK (addresses_ibfk_1) rejects the change.
  "ALTER TABLE `addresses` MODIFY COLUMN `user_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL",
];

const run = async () => {
  await sequelize.authenticate();
  for (const sql of stmts) {
    try {
      await sequelize.query(sql);
      console.log("applied:", sql);
    } catch (err) {
      if (/Duplicate column name/i.test(err.message)) {
        console.log("skip (exists):", sql.match(/ADD COLUMN `(\w+)`/)[1]);
      } else {
        console.error("FAILED:", sql, "\n ", err.message);
      }
    }
  }
  // backfill updated_at from created_at where it defaulted to "now"
  await sequelize.query("UPDATE `orders` SET `updated_at` = `created_at` WHERE `updated_at` < `created_at` OR `updated_at` IS NULL");
  console.log("done");
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
