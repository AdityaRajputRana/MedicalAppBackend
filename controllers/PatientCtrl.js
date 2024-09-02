import "dotenv/config";
import { paginationLimit } from "../config.js";
import Case from "../models/case.js";
import Patient from "../models/patient.js";
import Staff from "../models/staff.js";
import { getFormattedDateTime } from "../utils/DateUtils.js";
import sendReponse, {
    sendBadRequest,
    sendNotFound
} from "./ResponseCtrl.js";

export const editPatientProfile = async (req, res) => {
  let gender = req.body.gender;
  let age = req.body.age;
  let email = req.body.email;
  let fullName = req.body.fullName;

  let patient = await Patient.findOne({ _id: req.uid }).catch((err) =>
    sendBadRequest("Error while finding patient", err, res)
  );
  if (!patient) {
    sendNotFound("Patient not found", "Patient not found", res);
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
  await patient.save().catch((err) => {
    sendBadRequest("Error while saving patient", err, res);
    return;
  });

  sendReponse(true, "Patient Profile Update", patient, res);
};

export const getPatientHome = async (req, res) => {
  let mobileNumber = req.mobileNumber;

  const cases = await Case.find({
    mobileNumber: mobileNumber,
    pdf: { $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .catch((err) => sendBadRequest("Error while finding cases", err, res));

  let data = {
    prescriptions: cases,
  };

  sendReponse(true, "Got latest history", data, res);
};

export const getPatientPrescriptions = async (req, res) => {
  const mobileNumber = req.mobileNumber;
  const pageNumber = parseInt(req.body.pageNumber) || 1;

  const totalCases = await Case.countDocuments({
    mobileNumber: mobileNumber,
    pdf: { $ne: null },
  }).catch((err) => sendBadRequest("Error while counting cases", err, res));

  const totalPages = Math.ceil(totalCases / paginationLimit);

  const cases = await Case.find({
    mobileNumber: mobileNumber,
    pdf: { $ne: null },
  })
    .sort({ updatedAt: -1 })
    .skip((pageNumber - 1) * paginationLimit)
    .limit(paginationLimit)
    .catch((err) => sendBadRequest("Error while finding cases", err, res));

  let data = {
    currentPage: pageNumber,
    totalPages,
    cases,
  };

  sendReponse(true, "Got Prescriptions", data, res);
};

export const viewCase = async (req, res) => {
  let caseId = req.body.caseId;
  let mobileNumber = req.mobileNumber;

  let mCase = await Case.findOne({
    _id: caseId,
    mobileNumber: mobileNumber,
  }).catch((err) =>sendBadRequest("Error while finding case", err, res));
  let doctor = await Staff.findOne({ _id: mCase.doctorId }).catch((err) =>
    sendNotFound("Error while finding doctor", err, res)
  );
  if (mCase) {
    let mDoc;
    let patient = {
      name: mCase.fullName,
      age: mCase.age,
      gender: mCase.gender == "M" ? "Male" : "Female",
    };
    if (doctor) {
      mDoc = {
        _id: doctor._id,
        name: doctor.fullName,
        displayPicture: doctor.displayPicture,
        hospital: doctor.hospital,
        title: doctor.title,
      };
    }
    let data = {
      title: "Regular Visit",
      _id: mCase.id,
      updatedAt: getFormattedDateTime(mCase.updatedAt),
      diagnosis: "OPD",
      patient: patient,
      documents: [
        {
          title: "Doctor's Prescription",
          type: "PDF",
          url: mCase.pdf.publicUrl,
        },
      ],
      doctor: mDoc,
      additionals: mCase.additionals,
    };

    sendReponse(true, "", data, res);
  } else {
    sendNotFound("Case Not Found", "Case Not Found", res);
  }
};
