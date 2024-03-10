import Case from "../models/case.js"
import Page from "../models/page.js";
import Staff from "../models/staff.js";
import sendReponse, {sendError} from "./ResponseCtrl.js";
import 'dotenv/config'
import { QueueJobNames, paginationLimit } from "../config.js";
import { getFormattedDateTime } from "../utils/DateUtils.js";
import { taskQueues } from "../app.js";
import { makePdf } from "../utils/PdfGenerator.js";

async function mergeCases(req, res) {
    const { fromCaseId, toCaseId } = req.body;
    const { hospitalId } = req;
    const updateResult = await Page.updateMany({ caseId: fromCaseId, hospitalId: hospitalId }, { $set: { caseId: toCaseId } })
        .catch(err => sendError(res, err, "Merging pages"));
    
    let oldCase = await Case.findOne({ _id: fromCaseId });
    if (!oldCase) {
        oldCase = { pageNumbers: [], additionals: [] }
    }


    const updatedCount = updateResult.modifiedCount;

    const updatedCase = await Case.updateOne(
        {
            _id: toCaseId,
            hospitalId: hospitalId
        },
        {
            $inc: { pageCount: updatedCount },
            $push: {
                pageNumbers: {
                    $each: (oldCase.pageNumbers) ? oldCase.pageNumbers : [],
                },
            },
            $push: {
                additionals: {$each: (oldCase.additionals)?oldCase.additionals:[]}
            }
        }
    ).catch(err => sendError(res, err, "updating total pages (" + updatedCount + ")"));
    
    if (updatedCase) {
        await Case.deleteOne({ _id: fromCaseId, hospitalId: hospitalId })
            .catch(err => sendError(res, err, "Deleting old case"));
    }
    
    sendReponse(true, "Cases merged successfully", {}, res);
}


async function getCasesHistory(req, res) {
    let hospitalId = req.hospitalId;
    let { doctorId, creatorId, pageNumber } = req.body;
    pageNumber = Math.max(1, pageNumber);


    const query = Case.find({});
    if (hospitalId) {
        query.where('hospitalId').equals(hospitalId);
    }

    if (doctorId) {
        query.where('doctorId').equals(doctorId);
    }

    if (creatorId) {
        query.where('creatorId').equals(creatorId);
    }

    const countQuery = query.model.find(query._conditions);
    const totalCount = await countQuery.countDocuments().catch(err=>sendError(res, err,  "Counting documents"));

    query.sort({ updatedAt: -1 });
    query.skip((pageNumber - 1) * paginationLimit);
    query.limit(paginationLimit);

    const cases = await query.exec().catch(err=>sendError(res, err, "Fetching cases"));
    const totalPages = Math.ceil(totalCount / paginationLimit);

    let data = {
        cases,
        totalPages,
        currentPage: pageNumber,
    }

    sendReponse(true, "Case history fetched", data, res);
    return;

}

async function submitCase(req, res) {
    const { caseId } = req.body;
    const job = await taskQueues.mainQueue.add(QueueJobNames.generatePdf, { caseId: caseId });

    console.log('Job added:', job.id);
    await Case.updateOne({ _id: caseId }, {
        $set: {
            pdfTask: { jobId: job.id, status: "PENDING", updatedAt: Date.now() }
        }
    }).catch(err => sendError(res, err, "Updating Case"));

    const queueLength = await taskQueues.mainQueue.count();
    const expectedTime = queueLength * 3 + 10;
    const response = {
        jobId: job.id,
        queueLength: queueLength,
        expectedTime: expectedTime,
    };

    sendReponse(true, "Prescription is added to queue and will be shared with user once it is ready.", response, res);
}

async function generateCasePDF(req, res) {
    const { caseId } = req.body;

    const pages = await Page.find({ caseId })
        .catch(err => sendError(res, err, "Getting pages"));
    
    const url = await makePdf(pages, 100, 100, null, null)
        .catch(err => sendError(res, err, "Generating pdf"));
    
    let pdf = {
        publicUrl: url,
        updatedAt: Date.now()
    }
    
    await Case.updateOne({ _id: caseId }, {
        $set: {
            pdf
        }
    }).catch(err => sendError(res, err, "Updating Case"));
    
    sendReponse(true, "Latest PDF Generated", {
        pdfUrl: url
    }, res);
}


async function viewCase(req, res) {
    const { caseId } = req.body;

    let mCase = await Case.findOne({ _id: caseId})
        .catch(err => sendError(res, err, "Fetching case"));
    
    let doctor = await Staff.findOne({ _id: mCase.doctorId })
        .catch(err => sendError(res, err, "Finding doctor"));
    
    let documents = [];
    let shareRequired = true;

    if (mCase.pdf) {
        documents.push({
            title: "Doctor's Prescription",
            type: "PDF",
            url: mCase.pdf.publicUrl,
        });
        if (mCase.pdf.updatedAt >= mCase.updatedAt) {
            shareRequired = false;
        }
    }
    
    if (mCase) {
        let mDoc;
        let patient = {
            name: mCase.fullName,
            age: mCase.age,
            mobileNumber: mCase.mobileNumber,
            gender: (mCase.gender == "M")? "Male":"Female"
        }
        if (doctor) {
            mDoc = {
                _id: doctor._id,
                name: doctor.fullName,
                displayPicture: doctor.displayPicture,
                hospital: doctor.hospital,
                title: doctor.title
            }
        }
        let data = {
            title: "Regular Visit",
            _id: mCase.id,
            updatedAt: getFormattedDateTime(mCase.updatedAt),
            diagnosis: "OPD",
            patient: patient,
            documents,
            doctor: mDoc,
            pageNumbers: mCase.pageNumbers,
            shareRequired: shareRequired,
            additionals:mCase.additionals

        }

        sendReponse(true, "", data, res);
    } else {
        sendReponse(false, "Case Not Found", {}, res);
    }
}

export { mergeCases, getCasesHistory, submitCase, viewCase, generateCasePDF };





