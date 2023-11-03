import express from 'express';
import 'dotenv/config'
import {AuthRouter} from './routers/AuthRouter.js';


const app = express();

app.get('/', (req, res) => {
    res.status(200)
        .send("Hello world. I am live!");
})

app.use('/auth', AuthRouter);


app.listen(process.env.PORT, () => {
    console.log(`Server started at http://localhost:${process.env.PORT}`)
})
