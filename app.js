import express from 'express';
import 'dotenv/config'
import { AuthRouter } from './routers/AuthRouter.js';
import mongoose from 'mongoose';
import Staff from './models/staff.js';
import { APIRouter } from './routers/ApiRouter.js';
import PatientRouter from './routers/PatientRouter.js';



const app = express();
app.use(express.json());

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
db.once('open', () => {
    console.log('Connected to MongoDB');
});



app.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}`)
})
