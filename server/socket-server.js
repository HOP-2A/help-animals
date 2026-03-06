import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("send_message", async (data) => {
    try {
      const message = await prisma.message.create({
        data: {
          content: data.content,
          senderId: data.senderId,
          conversationId: data.conversationId,
        },
        include: { sender: true },
      });
      io.to(data.conversationId).emit("receive_message", message);
    } catch (error) {
      console.error("DB error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("out:", socket.id);
  });
});

httpServer.listen(3001, () => console.log("Port 3001"));
