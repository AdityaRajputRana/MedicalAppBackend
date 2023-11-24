import Patient from "../models/patient.js";
import sendReponse, { sendError } from "./ResponseCtrl.js";
import 'dotenv/config'


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