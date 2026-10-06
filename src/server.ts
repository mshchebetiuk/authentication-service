import { app } from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = 3000;

const startServer = async () => {
  try {
    const userCount = await prisma.user.count();

    console.log(`Database connected. Users: ${userCount}`);

    app.listen(PORT, () => {
      console.log(
        `Authentication Service is running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
