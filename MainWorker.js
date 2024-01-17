import { Worker } from "bullmq";
import { TaskQueueIds, QueueJobNames, redisConnection } from "./config.js";
import mongoose from 'mongoose';
import 'dotenv/config'
import {makePdf } from "./utils/PdfGenerator.js"
import Page from "./models/page.js";
import Case from "./models/case.js";

async function generatePDF(job) {
    const { caseId } = job.data;

    try {
        //let the timeout grow exponentially from 20 seconds to 10 minutes based on attempts made, attempts are from 1 to 3
        let timeout = 10000 * Math.pow(2, job.attemptsMade);
        const pages = await Page.find({ caseId })
            .maxTimeMS(timeout)
            .catch(err => {throw err});
        
        const url = await makePdf(pages, 100, 100, null, null)
            .catch(err => {throw err});
        
        let pdf = {
            publicUrl: url,
            updatedAt: Date.now()
        }
        
        await Case.updateOne({ _id: caseId }, {
            $set: {
                pdf,
                pdfTask: { jobId: job.id, status: "COMPLETED", updatedAt: Date.now() }
            }
        })
            .maxTimeMS(timeout)
            .catch(err => { throw err });
        
        return { success: true };
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}


function startWorker() {
    const worker = new Worker(TaskQueueIds.mainQueue, async (job) => {
        console.log(`Processing job ${job.id} of case ${job.data.caseId}`);
        if (job.name === QueueJobNames.generatePdf) {
            const result = await generatePDF(job).catch(err => { throw err });
            return result;
        }
    }, { connection: redisConnection });

    worker.on('completed', (job, result) => {
        console.log(`Job ${job.id} of case ${job.data.caseId} completed with result ${result}`);
    });
    worker.on('failed', async (job, err, prev) => {
        console.log(`Job ${job.id} of case ${job.data.caseId} failed with error ${err} with attempts ${job.attemptsMade} of ${job.opts.attempts}`);
        if (job.name === QueueJobNames.generatePdf) {
            const caseId = job.data.caseId;
            if (job.attemptsMade >= job.opts.attempts) {
                let pdfTask = { jobId: job.id, status: "FAILED", updatedAt: Date.now(), error: err, message: err.message };
                await Case.updateOne({ _id: caseId }, {
                    $set: {
                        pdfTask
                    }
                }).catch(err => { throw err });
            }
        }
    });
}

const mongoConnUri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.p0orpnl.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongoConnUri);
const db = mongoose.connection;
db.on('error', (err) => {
  console.error('Worker MongoDB connection error:', err);
});
db.once('open', () => {
    console.log('Connected to MongoDB from worker');
    startWorker();
});
console.log("Worker started");


