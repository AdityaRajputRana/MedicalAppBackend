import Patient from "../models/patient.js";
import Case from "../models/case.js";
import sendReponse, { sendError } from "./ResponseCtrl.js";
import 'dotenv/config'
import { paginationLimit } from "../config.js";


export const editPatientProfile = async (req, res) => {
    let gender = req.body.gender;
    let age = req.body.age;
    let email = req.body.email;
    let fullName = req.body.fullName;

    let patient = await Patient.findOne({ _id: req.uid })
        .catch(err=>sendError(res, err,  "Finding Patient"));
    if (!patient) {
        sendReponse(false, "Invalid Patiend ID", null, res);
        return;
    }

    if (gender) {
        patient.gender = gender;
    }
    if (fullName) {
        patient.fullName = fullName;
    }
    if (email) {
        patient.email = email;
    }
    //Todo: Update to DOB
    if (age) {
        patient.age = age;
    }

    patient.updatedAt = Date.now();
    if (fullName || patient.fullName) {
        if (patient.isNewUser) {
            patient.isNewUser = false;
        }
    }
    await patient.save().catch(err => {
        sendError(res, err, "Saving page");
        return;
    });

    sendReponse(true, "Patient Profile Update", patient, res);

}

export const getPatientHome = async (req, res) => {
    let mobileNumber = req.mobileNumber;

    const cases = await Case.find({
      mobileNumber: mobileNumber,
      pdf: { $ne: null }
    })
        .sort({ updatedAt: -1 })
        .limit(10)
        .catch(err => sendError(res, err, "Finding latest cases"));
    
    let data = {
        prescriptions: cases
    }

    sendReponse(true, "Got latest history", data, res);
    
}

export const getPatientPrescriptions = async (req, res) => {
    const mobileNumber = req.mobileNumber;
    const pageNumber = parseInt(req.body.pageNumber) || 1;

    const totalCases = await Case.countDocuments({
        mobileNumber: mobileNumber,
        pdf: { $ne: null }
    })
        .catch(err => sendError(res, err, "Counting documents"));
    
    const totalPages = Math.ceil(totalCases / paginationLimit);

    const cases = await Case.find({
            mobileNumber: mobileNumber,
            pdf: { $ne: null }
        })
        .sort({ updatedAt: -1 })
        .skip((pageNumber - 1) * paginationLimit)
        .limit(paginationLimit)
        .catch(err=>sendError(res, err, "Getting Cases"));
    
    
    let data = {
        currentPage: pageNumber,
        totalPages,
        cases
    };

    sendReponse(true, "Got Prescriptions", data, res);
    
    
}