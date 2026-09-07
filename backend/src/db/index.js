import mysql from "mysql2/promise"
import dotenv from "dotenv"
import Sequelize from "sequelize"

dotenv.config()

const sequelize = new Sequelize(process.env.DB_URI, {
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