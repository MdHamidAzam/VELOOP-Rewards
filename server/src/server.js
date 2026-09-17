import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

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
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error(`Server startup aborted: ${error.message}`);
    process.exitCode = 1;
  }
}

startServer();