import app from "./server";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing server...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
  });
});
