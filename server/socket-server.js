import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("send_message", async (data) => {
    const message = await prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        conversationId: data.conversationId,
      },
      include: { sender: true },
    });

    io.to(data.conversationId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("out:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log("Server running on", PORT);
});
