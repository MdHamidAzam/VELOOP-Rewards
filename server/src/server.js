import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { seedGiveaways } from "./scripts/seedGiveaways.js";

async function startServer() {
  try {
    if (!env.mongoUri) {
      console.warn("MONGO_URI is not configured. Starting the VELOOP server in development demo mode without MongoDB persistence.");
      app.listen(env.port, () => {
        console.log(`Server listening on port ${env.port} (development demo mode)`);
      });
      return;
    }

    await connectDB();
    if (env.seedGiveawaysOnBoot) {
      console.log("Temporary giveaway boot seed enabled. Starting idempotent upsert.");
      try {
        await seedGiveaways();
      } catch (error) {
        console.error(`Temporary giveaway boot seed failed: ${error.message}`);
        throw error;
      }
      console.log("Temporary giveaway boot seed completed successfully.");
    }
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error(`Server startup aborted: ${error.message}`);
    process.exitCode = 1;
  }
}

startServer();