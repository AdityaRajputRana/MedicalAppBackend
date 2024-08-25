import "dotenv/config";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";

export const saltRounds = 10;
export const defaultPageType = "DEFAULT";

export const defaultPageHeight = 150;
export const defaultPageWidth = 70;
export const defaultScaleFactor = 0.2;

export const paginationLimit = 15;
export const TaskQueueIds = {
  mainQueue: "mainQueue",
};

export const QueueJobNames = {
  generatePdf: "GENERATE_PRESCRIPTION_PDF",
};

export const redisConnection = {
  host: "redis-19713.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  port: 19713,
  password: "lyGBJRFvTj0V3UxWgd7jxOKb5xCBVKXj",
};

export const WSServer = (server) => {
  const wss = new WebSocketServer({ server: server });

  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
      console.log("Received message:", message.toString());
      // Process message here
      ws.send(`You sent: ${message}`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected");

    // Listen for the 'message' event
    socket.on("message", (data) => {
      console.log("Received message:", data);

      // Echo the message back to the client
      socket.emit("message", data);
      socket.broadcast.emit("message", data);
    });

    //Disconnect the socket
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });
}
