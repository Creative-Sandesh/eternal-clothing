import { sequelize } from "./db/index.js";
import * as models from "./models/relation.js";

const syncDB = async () => {
  try {
    console.log("Starting DB sync...");
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log("Database tables synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database synchronization failed:", error);
    process.exit(1);
  }
};

syncDB();
