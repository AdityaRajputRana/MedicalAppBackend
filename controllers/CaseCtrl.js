import Case from "../models/case.js"
import sendReponse, {sendError} from "./ResponseCtrl.js";
import 'dotenv/config'
import { paginationLimit } from "../config.js";

async function mergeCases() {
    
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

export { mergeCases, getCasesHistory };





