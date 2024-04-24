import { paginationLimit } from "../config.js";
import HospitalsPatient from "../models/HospitalsPatient.js";
import CareGuide from "../models/careGuide.js";
import Case from "../models/case.js";
import Hospital from "../models/hostpital.js";
import Staff from "../models/staff.js";
import sendReponse, { sendError } from "./ResponseCtrl.js";
import 'dotenv/config'


export const getHome = async (req, res) => {

    let hospitalId = req.hospitalId;
    let staffId = req.uid;
    let staffDetails = await Staff.findOne({ _id: staffId }, {fullName: 1, title: 1, hospital: 1}).catch(err=>sendError(res, err, "Getting staff details"));
    let analytics = await getHospitalPatientAnalytics(hospitalId).catch(err => sendError(res, err, "Getting hospital patient analytics"));
    let data = {
        staffDetails, analytics
    };
    sendReponse(true, "Home data fetched", data, res);
}

 /*This function returns analytics of patient of a hospital
    * @param {String} hospitalId
    * @return {Object} analytics
Analytics will have data like total patients for today so far and in total,
separated into M and F genders.
Use HospitalPatient model to extract data.
*/
async function getHospitalPatientAnalytics(hospitalId) {
    let totalPatients = await HospitalsPatient.find({ hospitalId: hospitalId }).countDocuments();
    let totalMalePatients = await HospitalsPatient.find({ hospitalId: hospitalId, gender: "M" }).countDocuments();
    let totalFemalePatients = await HospitalsPatient.find({ hospitalId: hospitalId, gender: "F" }).countDocuments();
    
    let patientsToday = await HospitalsPatient.find({ hospitalId: hospitalId, createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }).countDocuments();
    let malePatientsToday = await HospitalsPatient.find({hospitalId: hospitalId, gender: "M", createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }).countDocuments();
    let femalePatientsToday = await HospitalsPatient.find({ hospitalId: hospitalId, gender: "F", createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }).countDocuments();
    
    let analytics = {
        total: {
            count: totalPatients,
            male: totalMalePatients,
            female: totalFemalePatients
        },
        todaySoFar: {
            count: patientsToday,
            male: malePatientsToday,
            female: femalePatientsToday
        }
    }

    return analytics;
}

export const getPatientHistory = async (req, res) => {
    let hospitalId = req.hospitalId;
    let { doctorId, creatorId, pageNumber, searchQuery } = req.body;
    if (!pageNumber) {
        pageNumber = 0;
    }
    pageNumber = Math.max(1, pageNumber);

    let query = {};

    if (searchQuery) {
        query.$text = {$search: searchQuery};
    }

    let conditions = [];

    if (hospitalId) {
        conditions.push({hospitalId: hospitalId});
    }

    if (doctorId) {
        conditions.push({doctorId: doctorId});
    }

    if (creatorId) {
        conditions.push({creatorId: creatorId});
    }

    if (conditions.length > 0) {
        query.$and = conditions;
    }

    let countQuery = HospitalsPatient.countDocuments(query);
    let totalCount = await countQuery.catch(err => sendError(res, err, "Counting documents"));

    const patients = await HospitalsPatient.find(query)
        .sort({ updatedAt: -1 })
        .skip((pageNumber - 1) * paginationLimit)
        .limit(paginationLimit)
        .catch(err => sendError(res, err, "Fetching cases"));

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
        return;
    }

    const patientCases = await Case.find({ hospitalPatientId: patientId })
        .catch(err=>sendError(res, err, "Getting patient's cases"));

    let data = {
        patientDetails,
        patientCases
    }

    sendReponse(true, "got it ", data, res);

    
}

// suggest another name for this function that matches its functionality
export const getPageConfig = async (req, res) => {
    const hospitalId = req.hospitalId;
    const doctorId = req.uid;

    const guides = await CareGuide.find({ doctorId: doctorId })
        .sort({ position: 1 })
        .catch(err => sendError(res, err, "Getting guides"));
    
    const hospitalDetails = await Hospital.findOne({ _id: hospitalId })
        .catch(err => sendError(res, err, "Getting hospital details"));
    
    let pageDetails;
    if (hospitalDetails) {
        pageDetails = {
            pageHeight: hospitalDetails.pageHeight,
            pageWidth: hospitalDetails.pageWidth,
            pageBackground: hospitalDetails.pageBackground,
        }
    }

    let data = {
        guides,
        pageDetails
    }

    sendReponse(true, "got it ", data, res);
}