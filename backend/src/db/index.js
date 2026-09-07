import mysql from "mysql2/promise"
import dotenv from "dotenv"
import Sequelize from "sequelize"

dotenv.config()

// Point at an isolated database when TEST_DB_URI is set and we're in a test
// context — the Vitest runner, or an explicit NODE_ENV=test for the
// sync/migrate/seed scripts. Lets write-path tests run without touching dev
// data. Falls back to DB_URI, so the existing read-only suite is unaffected.
const inTestContext = process.env.VITEST || process.env.NODE_ENV === "test"
const dbUri = (inTestContext && process.env.TEST_DB_URI) || process.env.DB_URI

const sequelize = new Sequelize(dbUri, {
    dialect: "mysql",
    logging: false
})

const ConnectDB = async() => {
  try {
    await sequelize.authenticate();

    console.log("MySQL connected successfully");

    // Start your Express server here
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

export {ConnectDB, sequelize}
export default sequelize