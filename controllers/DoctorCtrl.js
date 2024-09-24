import "dotenv/config";
import { paginationLimit } from "../config.js";
import HospitalsPatient from "../models/HospitalsPatient.js";
import CareGuide from "../models/careGuide.js";
import Case from "../models/case.js";
import Hospital from "../models/hostpital.js";
import PageConfigMeta from "../models/pageConfigMeta.js";
import Staff from "../models/staff.js";
import sendReponse, {
  sendBadRequest,
  sendNotFound
} from "./ResponseCtrl.js";

export const getHome = async (req, res) => {
  let hospitalId = req.hospitalId;
  let staffId = req.uid;
  let staffDetails = await Staff.findOne(
    { _id: staffId },
    { fullName: 1, title: 1, hospital: 1 }
  ).catch((err) => sendBadRequest("Error while getting staff details", err, res));
  let analytics = await getHospitalPatientAnalytics(hospitalId).catch((err) =>
    sendBadRequest("Error while getting hospital patient analytics", err, res)
  );
  let data = {
    staffDetails,
    analytics,
  };
  sendReponse(true, "Home data fetched", data, res);
};

/*This function returns analytics of patient of a hospital
    * @param {String} hospitalId
    * @return {Object} analytics
Analytics will have data like total patients for today so far and in total,
separated into M and F genders.
Use HospitalPatient model to extract data.
*/
async function getHospitalPatientAnalytics(hospitalId) {
  let totalPatients = await HospitalsPatient.find({
    hospitalId: hospitalId,
  }).countDocuments();
  let totalMalePatients = await HospitalsPatient.find({
    hospitalId: hospitalId,
    gender: "M",
  }).countDocuments();
  let totalFemalePatients = await HospitalsPatient.find({
    hospitalId: hospitalId,
    gender: "F",
  }).countDocuments();

  let patientsToday = await HospitalsPatient.find({
    hospitalId: hospitalId,
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  }).countDocuments();
  let malePatientsToday = await HospitalsPatient.find({
    hospitalId: hospitalId,
    gender: "M",
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  }).countDocuments();
  let femalePatientsToday = await HospitalsPatient.find({
    hospitalId: hospitalId,
    gender: "F",
    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
  }).countDocuments();

  let analytics = {
    total: {
      count: totalPatients,
      male: totalMalePatients,
      female: totalFemalePatients,
    },
    todaySoFar: {
      count: patientsToday,
      male: malePatientsToday,
      female: femalePatientsToday,
    },
  };

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
    query.$text = { $search: searchQuery };
  }

  let conditions = [];

  if (hospitalId) {
    conditions.push({ hospitalId: hospitalId });
  }

  if (doctorId) {
    conditions.push({ doctorId: doctorId });
  }

  if (creatorId) {
    conditions.push({ creatorId: creatorId });
  }

  if (conditions.length > 0) {
    query.$and = conditions;
  }

  let countQuery = HospitalsPatient.countDocuments(query);
  let totalCount = await countQuery.catch((err) =>
    sendBadRequest("Error while counting documents", err, res)
  );

  const patients = await HospitalsPatient.find(query)
    .sort({ updatedAt: -1 })
    .skip((pageNumber - 1) * paginationLimit)
    .limit(paginationLimit)
    .catch((err) => sendBadRequest("Error while fetching patients", err, res));

  const totalPages = Math.ceil(totalCount / paginationLimit);

  let data = {
    patients,
    totalPages,
    currentPage: pageNumber,
  };

  sendReponse(true, "Patient history fetched", data, res);
  return;
};

export const viewPatient = async (req, res) => {
  const hospitalId = req.hospitalId;
  const patientId = req.body.patientId;

  const patientDetails = await HospitalsPatient.findOne({
    _id: patientId,
    hospitalId: hospitalId,
  }).catch((err) =>
    sendBadRequest("Error while getting patient details", err, res)
  );

  if (!patientDetails) {
    sendNotFound(
      "Patient is not found on hospital's record",
      "Patient is not found on hospital's record",
      res
    );
    return;
  }

  const patientCases = await Case.find({ hospitalPatientId: patientId }).catch(
    (err) => sendBadRequest("Error while getting patient cases", err, res)
  );

  let data = {
    patientDetails,
    patientCases,
  };

  sendReponse(true, "Patient Cases Found", data, res);
};

// suggest another name for this function that matches its functionality
export const getPageConfig = async (req, res) => {
  const hospitalId = req.hospitalId;
  const doctorId = req.uid;

  const guides = await CareGuide.find({ doctorId: doctorId })
    .sort({ position: 1 })
    .catch((err) => sendBadRequest("Error while getting guides", err, res));

  const hospitalDetails = await Hospital.findOne({ _id: hospitalId }).catch(
    (err) => sendBadRequest("Error while getting hospital details", err, res)
  );

  let pageDetails;
  if (hospitalDetails) {
    const pageConfigMeta = await PageConfigMeta.findOne({
      hospitalId,
      doctorId,
    })
    pageDetails = {
      pageHeight: hospitalDetails.pageHeight,
      pageWidth: hospitalDetails.pageWidth,
      pageBackground: hospitalDetails.pageBackground,
    };

    if (pageConfigMeta) {
      pageDetails.configUrl = pageConfigMeta.configUrl;
      pageDetails.__v=pageConfigMeta.__v;
    }

  }

  let data = {
    guides,
    pageDetails,
  };

  sendReponse(true, "Page Config Found", data, res);
};

export const getPageConfigMetadata = async (req, res) => {
  const hospitalId = req.hospitalId;
  const doctorId = req.uid;

  const pageConfigMeta = await PageConfigMeta.findOne({
    hospitalId,
    doctorId,
  }).catch((err) =>
    sendBadRequest("Error while getting page metadata", err, res)
  );

  if (pageConfigMeta) {
    sendReponse(true, "Got Page Metadata", pageConfigMeta, res);
    return;
  }
  sendNotFound(
    "Page Metadata is not found for the given doctor. Please Contact Administrator",
    err,
    res
  );
};

export const updatePageConfigMetadata = async (req, res) => {
  const hospitalId = req.hospitalId;
  const doctorId = req.uid;

  const configUrl = req.body.configUrl;

  let configMetaData = await PageConfigMeta.findOne({
    hospitalId,
    doctorId,
  }).catch((err) =>
    sendBadRequest("Error while Finding Page Metadata Details", err, res)
  );

  if (!configMetaData) {
    configMetaData = new PageConfigMeta({
      doctorId,
      hospitalId,
      configUrl,
    });
  } else {
    configMetaData.configUrl = configUrl;
    configMetaData.__v = configMetaData.__v + 1;
  }
  await configMetaData.save();
  sendReponse(true, "Config Updated Successfully", configMetaData, res);
};

//Function to add a new patient to HospitalPatient collection with details fullName, mobileNumber, age, gender, doctorId, creatorId, hospitalId
export const addNewPatient = async (req, res) => {
  let hospitalId = req.hospitalId;
  let creatorId = req.uid;
  let { fullName, mobileNumber, age, gender } = req.body;
  let createdAt = Date.now();
  let updatedAt = Date.now();

  let patient = new HospitalsPatient({
    fullName,
    mobileNumber,
    age,
    gender,
    creatorId,
    hospitalId,
    createdAt,
    updatedAt,
  });

  let newPatient = await patient
    .save()
    .catch((err) => sendBadRequest("Error while adding new patient", err, res));
  let viewPatientResponse = {
    patientDetails: newPatient,
    patientCases: [],
  };
  sendReponse(true, "Patient Added", viewPatientResponse, res);
};
