import { Queue } from 'bullmq';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { TaskQueueIds, WSServer, redisConnection } from './config.js';
import HospitalsPatient from './models/HospitalsPatient.js';
import { APIRouter } from './routers/ApiRouter.js';
import { AuthRouter } from './routers/AuthRouter.js';
import PatientRouter from './routers/PatientRouter.js';



const app = express();
app.use(express.json());


const server = http.createServer(app);
const wss = WSServer(server);



const defaultQueueOptions = {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: true
    },
    connection: redisConnection
}
const taskQueues = {
    mainQueue: new Queue(TaskQueueIds.mainQueue, defaultQueueOptions)
}


export { taskQueues };
app.get('/', (req, res) => {
    res.status(200)
        .send("Hello world. I am live!");
})

app.use('/auth', AuthRouter);
app.use('/api', APIRouter);
app.use('/patient', PatientRouter);



const mongoConnUri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.p0orpnl.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongoConnUri);
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
db.once('open', async() => {
    console.log('Connected to MongoDB');
    HospitalsPatient.collection.createIndex({ searchIndex: "text" });
});



app.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}`)
})
