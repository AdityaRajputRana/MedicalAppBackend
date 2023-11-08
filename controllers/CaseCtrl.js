import Case from "../models/case.js"
import sendReponse, {sendError} from "./ResponseCtrl.js";
import 'dotenv/config'

async function mergeCases() {
    
}

async function getCasesHistory(req, res) {
    let hospitalId = req.hospitalId;
    let doctorId = req.body.doctorId;
    let creatorId = req.body.creatorId;

    let pageNumber = Math.max(0, req.body.pageNumber);

}

export { mergeCases, getCasesHistory };





