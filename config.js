import 'dotenv/config';
import { WebSocketServer } from 'ws';

export const saltRounds = 10;
export const defaultPageType = "DEFAULT";

export const defaultPageHeight = 150;
export const defaultPageWidth = 70;
export const defaultScaleFactor = 0.2;

export const paginationLimit = 15;
export const TaskQueueIds = {
    mainQueue: "mainQueue",
}

export const QueueJobNames = {
generatePdf: "GENERATE_PRESCRIPTION_PDF"
}

export const redisConnection = {
    host: "redis-19713.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 19713,
    password: "lyGBJRFvTj0V3UxWgd7jxOKb5xCBVKXj"
}

export const WSServer = () => {
    const port = process.env.WEBSOCKET_PORT || 4123;
    const wss = new WebSocketServer({port: port});
    console.log("Socket Ka Port", port);
  
    wss.on('connection', (ws) => {
        console.log('Client connected');

    
      ws.on('message', (message) => {
        console.log('Received message:', message.toString());
        // Process message here
        ws.send(`You sent: ${message}`);
      });


  
      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }