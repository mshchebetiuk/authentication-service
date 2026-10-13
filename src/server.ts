import { app } from "./app.js";
import { prisma } from "./config/prisma.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

const startServer = async () => {
  try {
    const userCount = await prisma.user.count();

    console.log(`Database connected. Users: ${userCount}`);

    const server = app.listen(PORT, () => {
      console.log(
        `Authentication Service is running on http://localhost:${PORT}`,
      );
    });

    let isShuttingDown = false;

    const shutdown = (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`Received ${signal}. Shutting down...`);

      const timeout = setTimeout(() => {
        console.error("Shutdown timeout exceeded");
        process.exit(1);
      }, 10000);

      timeout.unref();

      server.close(async (error) => {
        try {
          await prisma.$disconnect();

          if (error) {
            console.error("HTTP server shutdown failed:", error);
            process.exitCode = 1;
          } else {
            console.log("Server closed successfully");
            process.exitCode = 0;
          }
        } catch (disconnectError) {
          console.error("Database disconnect failed:", disconnectError);
          process.exitCode = 1;
        } finally {
          clearTimeout(timeout);
        }
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect;

    process.exitCode = 1;
  }
};

void startServer();
