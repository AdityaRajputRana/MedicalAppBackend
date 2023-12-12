import { paginationLimit } from "../config.js";
import HospitalsPatient from "../models/HospitalsPatient.js";
import Case from "../models/case.js";
import Staff from "../models/staff.js";
import sendReponse, { sendError } from "./ResponseCtrl.js";
import 'dotenv/config'


export const getHome = async (req, res) => {

    let data = {
        naam: "Bhupendar Jogi",
        americaMeKahaGhoomeHo: "Bohot jagah",
        naamBatayiye: "Bhupendar Jogi"
    }
    sendReponse(true, "Home fetched", data, res);
}

export const getPatientHistory = async (req, res) => {
    let hospitalId = req.hospitalId;
    let { doctorId, creatorId, pageNumber } = req.body;
    if (!pageNumber) {
        pageNumber = 0;
    }
    pageNumber = Math.max(1, pageNumber);

    const query = HospitalsPatient.find({});
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

    const patients = await query.exec().catch(err=>sendError(res, err, "Fetching cases"));
    const totalPages = Math.ceil(totalCount / paginationLimit);

    let data = {
        patients,
        totalPages,
        currentPage: pageNumber,
    }

    sendReponse(true, "Patient history fetched", data, res);
    return;

}

export const viewPatient = async (req, res) => {
    const hospitalId = req.hospitalId;
    const patientId = req.body.patientId;


    const patientDetails = await HospitalsPatient.findOne({ _id: patientId, hospitalId: hospitalId })
        .catch(err => sendError(res, err, "Getting patient Details"));
    
    if (!patientDetails) {
        sendReponse(false, "Patient is not found on hostpital's record", {}, res);
    }

    const patientCases = await Case.find({ hospitalPatientId: patientId })
        .catch(err=>sendError(res, err, "Getting patient's cases"));

    let data = {
        patientDetails,
        patientCases
    }

    sendReponse(true, "got it ", data, res);

    
}