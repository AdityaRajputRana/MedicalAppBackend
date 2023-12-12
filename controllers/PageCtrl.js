import { defaultPageHeight, defaultPageType, defaultPageWidth } from "../config.js";
import HospitalsPatient from "../models/HospitalsPatient.js";
import Case from "../models/case.js";
import Page from "../models/page.js";
import { uploadToPermanentStorage } from "../utils/FileUploader.js";
import sendReponse, {sendError, sendString} from "./ResponseCtrl.js";
import 'dotenv/config'

async function initialisePage(req, res) {
    let hospitalId = req.hospitalId;
    let pageNumber = req.body.pageNumber;
    let width = defaultPageWidth;
    let height = defaultPageHeight;

    let page = await Page.findOne({
        hospitalId: hospitalId,
        pageNumber: pageNumber
    }).catch(err => {
        sendError(res, err, "Fetching page");
        return;
    });

    if (page) {
        let patientDetails;
        if (page.hospitalPatientId) {
            patientDetails = await HospitalsPatient.findOne({ _id: page.hospitalPatientId })
                .catch(err => sendError(res, err, "Getting patient"));
        }
        let data = {
            isNewPage: false,
            page: page,
            patient: patientDetails
        }
        sendReponse(true, "", data, res);
    } else {
        let mCase = new Case({
            hospitalId: hospitalId,
            creatorId: req.uid,
            doctorId: req.uid, //Todo: This should be updated after adding associates
            pageCount: 1,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        await mCase.save().catch(err => sendError(res, err, "saving case"));
        page = new Page({
            caseId: mCase._id,
            hospitalId: hospitalId,
            creatorId: req.uid,
            doctorId: req.uid,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            pageNumber: pageNumber,
            width: width,
            height: height,
            pageType: defaultPageType,
            points: []
        });
        await page.save().catch(err => {
            sendError(res, err, "Saving Page");
            return;
        });
        let data = {
            isNewPage: true,
            page: page
        }
        sendReponse(true, "", data, res);
    }
}

async function uploadPointsToPage(req, res) {
    let pageNumber = req.body.pageNumber;
    let hospitalId = req.hospitalId;
    let pointsToAdd = req.body.pointsToAdd;

    let page = await Page.findOne({ pageNumber: pageNumber, hospitalId: hospitalId }).catch(err => sendError(res, err, "Finding page"));
    if (page) {
        for (var i = 0; i < pointsToAdd.length; i++){
            page.points.push(pointsToAdd[i]);
        }
        page.updatedAt = Date.now();
        await page.save().catch(err => {
            sendError(res, err, "Saving Page");
            return;
        });

        if (page.caseId) {
            Case.updateOne({ _id: page.caseId }, { updatedAt: Date.now() });
        }
        sendReponse(true, "Points saved successfully", {}, res);
        return;
    } else {
        sendReponse(false, "Invalid page number", {hospitalId: hospitalId}, res);
        return;
    }
}

async function addAdditional(req, res) {
    console.log(req.body);
    const hospitalId = req.hospitalId;
    const data = JSON.parse(req.body.data);
    console.log(data);
    const pageNumber = data.pageNumber;
    
    const filePath = "doctorUploads/" + hospitalId +"/"+ pageNumber;
    let metaData = {
        type: data.metaData.type,
        ext: data.metaData.ext,
        mime: data.metaData.mime,
        uploader: req.uid,
        uploadedAt: Date.now()
    }
    const saveResult = await uploadToPermanentStorage(req.file.path, filePath, metaData);

    const attachment = {
        public_url: saveResult.publicUrl,
        metaData,
        details: saveResult
    }

    const page = await Page.findOne({ hospitalId: hospitalId, pageNumber: pageNumber });
    const caseToUpdate = await Case.findOneAndUpdate(
      { _id: page.caseId },
      { $push: { additionals:  attachment} },
      { new: true }
    );
    
    sendString(true, "File Uploaded Successfully", { uploadedFile: attachment, updatedCase: caseToUpdate }, res);

    
    
}


async function addDetails(req, res) {
    let mobileNumber = req.body.mobileNumber;
    if (!mobileNumber) {
        sendReponse(false, "Mobile number is required in request", [], res);
        return;
    }
    let gender = req.body.gender;
    let fullName = req.body.fullName;
    let email = req.body.email;
    let pageNumber = req.body.pageNumber;
    let age = req.body.age;

    let doctorId = req.body.doctorId;
    
    let hospitalId = req.hospitalId;
    let staffId = req.uid;
    

    //Todo: link to patient if patient is already available
    let page = await Page.findOne({
        pageNumber: pageNumber,
        hospitalId: hospitalId
     }).catch(err => sendError(res, err, "finding page"));
    if (page) {
        let mCase;
        if (page.caseId) {
            mCase = await Case.findOne({ _id: page.caseId }).catch(err => sendError(res, err, "finding case"));
        } else {
            mCase = new Case({
                hospitalId: hospitalId,
                creatorId: req.body.uid,
                pageCount: 1,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            await mCase.save().catch(err => sendError(res, err, "saving case"));
            page.caseId = mCase.id;
        }
        if (mobileNumber) {
            page.mobileNumber = mobileNumber;
            mCase.mobileNumber = mobileNumber;
        }
        if (gender) {
            page.gender = gender;
            mCase.gender = gender;
        }
        if (fullName) {
            page.fullName = fullName;
            mCase.fullName = fullName;
        }
        if (email) {
            page.email = email;
            mCase.email = email;
        }
        if (doctorId) {
            page.doctorId = doctorId;
            mCase.doctorId = doctorId;
        }

        let patient = new HospitalsPatient({
            mobileNumber,
            age, gender, email, fullName, hospitalId, doctorId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            creatorId: staffId
        });

        await patient.save();

        page.hospitalPatientId = patient._id;
        mCase.hospitalPatientId = patient._id;
        page.updatedAt = Date.now();
        mCase.updatedAt = Date.now();

        await page.save().catch(err => {
            sendError(res, err, "Saving page");
            return;
        })

        await mCase.save().catch(err => {
            sendError(res, err, "Saving case");
            return;
        })
        sendReponse(true, "Page saved successfully", {
            patient: patient
        }, res);
    } else {
        sendReponse(false, "Page not found", {}, res);
    }
}

async function changeCase(req, res) {
    
}

async function addMobileNumber(req, res) {
    let hospitalId = req.hospitalId;
    let mobileNumber = req.body.mobileNumber;
    let pageNumber = req.body.pageNumber;

    let page = await Page.findOne({
        pageNumber: pageNumber,
        hospitalId: hospitalId
    }).catch(err => sendError(res, err, "finding page"));
    
    if (page) {
        let mCase;
        if (page.caseId) {
            mCase = await Case.findOne({ _id: page.caseId }).catch(err => sendError(res, err, "finding case"));
            mCase.mobileNumber = mobileNumber;
            await mCase.save();
        }

        if (mobileNumber) {
            page.mobileNumber = mobileNumber;
            page.updatedAt = Date.now();
        }

        let hospitalPatients = await HospitalsPatient.find(
            { mobileNumber: mobileNumber, hospitalId: hospitalId }
        ).catch(err => sendError(res, err, "Finding Hospital's patient"));

        for (const patient of hospitalPatients) {
            const openCases = await Case.find({
                hospitalPatient: patient._id,
                isOpen: true
            });

            patient.openCases = openCases;
        }

        let data = {
            patients: hospitalPatients
        }

        sendReponse(true, "Phone number linked and got related patients", data, res);

    } else {
        sendReponse(false, "Page not found", {}, res);
    }

}

async function linkPage(req, res) {
    let hospitalPatientId = req.body.patientId;
    let hospitalId = req.hospitalId;
    let caseId = req.body.caseId;
    let pageNumber = req.body.pageNumber;

    let page = await Page.findOne({
        pageNumber: pageNumber,
        hospitalId: hospitalId
    }).catch(err => sendError(res, err, "finding page"));

    if (!caseId) {
        let patient = await HospitalsPatient.findOne({ _id: hospitalPatientId })
            .catch(err => sendError(res, err, "Getting Hospital Patient"));
        const newCase = new Case({
            hospitalId,
            hospitalPatientId,
            isOpen: true,
            mobileNumber: patient.mobileNumber,
            email: patient.email,
            updatedAt: Date.now(),
            fullName: patient.fullName,
            gender: patient.gender,
            doctorId: req.uid,
            creatorId: req.uid,
            pageCount: 0,
            createdAt: Date.now()
        });
        await newCase.save();
        caseId = newCase._id;
    }

    if (page) {
        const prevCaseId = page.caseId;

        page.caseId = caseId;
        page.hospitalPatientId = hospitalPatientId;

            if (page.caseId != caseId) {
                if (page.caseId) {
                    let oldCase = await Case.findOne({ _id: page.caseId })
                        .catch(err => sendError(res, err, "Geting case document"));
                    
                    oldCase.pageCount -= 1;
                    if (oldCase.pageCount <= 0) {
                        await Case.findByIdAndDelete(prevCaseId); 
                    } else {
                        await oldCase.save();
                    }

                }

                const newCase = await Case.findById(caseId);
                if (newCase) {
                    newCase.pageCount += 1;
                    await newCase.save();
                }
            }
        
        await page.save()
            .catch(err => sendError(res, err, "Saving page"));
        
        sendReponse(true, "patient linked", {}, res);
    } else {
        sendReponse(false, "Page not found", {}, res);
    }
    
}



//Todo: make function to putDetails of mobile number and other stuff. Also if same phone number has the case merge two cases together.
//Page(s) -> case -> make function to link pages together to a case. i.e merge cases.

export { initialisePage, uploadPointsToPage, addDetails, changeCase, addMobileNumber, linkPage, addAdditional};


