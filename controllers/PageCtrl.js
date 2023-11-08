import { defaultPageHeight, defaultPageType, defaultPageWidth } from "../config.js";
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
            creatorId: req.body.uid,
            pageCount: 1,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        await mCase.save().catch(err => sendError(res, err, "saving case"));
        page = new Page({
            caseId: mCase._id,
            hospitalId: hospitalId,
            creatorId: req.body.uid,
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
    let hospitalId = req.body.hospitalId;
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
        sendReponse(false, "Invalid page id", {}, res);
        return;
    }
}


async function addDetails(req, res) {
    let mobileNumber = req.body.mobileNumber;
    let gender = req.body.gender;
    let fullName = req.body.fullName;
    let email = req.body.email;
    let pageId = req.body.pageId;

    let doctorId = req.body.doctorId;
    

    //Todo: link to patient if patient is already available
    let page = await Page.findOne({ _id: pageId }).catch(err => sendError(res, err, "finding page"));
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



//Todo: make function to putDetails of mobile number and other stuff. Also if same phone number has the case merge two cases together.
//Page(s) -> case -> make function to link pages together to a case. i.e merge cases.

export { initialisePage, uploadPointsToPage, addDetails, changeCase };


