import { defaultPageHeight, defaultPageType, defaultPageWidth } from "../config.js";
import HospitalsPatient from "../models/HospitalsPatient.js";
import Case from "../models/case.js";
import Page from "../models/page.js";
import sendReponse, {sendError} from "./ResponseCtrl.js";
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
        let data = {
            isNewPage: false,
            page: page
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
        sendReponse(true, "Page saved successfully", {}, res);
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



//Todo: make function to putDetails of mobile number and other stuff. Also if same phone number has the case merge two cases together.
//Page(s) -> case -> make function to link pages together to a case. i.e merge cases.

export { initialisePage, uploadPointsToPage, addDetails, changeCase, addMobileNumber };


