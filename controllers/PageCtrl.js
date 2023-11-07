import { defaultPageType } from "../config.js";
import Page from "../models/page.js";
import sendReponse, {sendError} from "./ResponseCtrl.js";
import 'dotenv/config'

async function initialisePage(req, res) {
    let hospitalId = req.hospitalId;
    let pageNumber = req.body.pageNumber;
    let width = req.body.pageWidth;
    let height = req.body.pageHeight;

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
        //make a new case and link this page to the case.
        page = new Page({
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
    let pageId = req.body.pageId;
    let hospitalId = req.body.hospitalId;
    let pointsToAdd = req.body.points;

    let page = await Page.findOne({ _id: pageId }).catch(err => sendError(res, err, "Finding page"));

    if (page) {
        for (var i = 0; i < pointsToAdd.length; i++){
            page.points.push(pointsToAdd[i]);
        }
        page.updatedAt = Date.now();
        await page.save().catch(err => {
            sendError(res, err, "Saving Page");
            return;
        });
        sendReponse(false, "Points saved successfully", {}, res);
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
    

    //Todo: link to patient if patient is already available
    let page = await Page({ _id: pageId }).catch(err => sendError(res, err, "finding page"));
    if (page) {
        if (mobileNumber)
            page.mobileNumber = mobileNumber;
        if (gender)
            page.gender = gender;
        if (fullName)
            page.fullName = fullName;
        if (email)
            page.email = email;

        await page.save().catch(err => {
            sendError(res, err, "Saving page");
            return;
        })
        sendReponse(true, "Page saved successfully", {}, res);
    } else {
        sendReponse(false, "Page not found", {}, res);
    }
}



//Todo: make function to putDetails of mobile number and other stuff. Also if same phone number has the case merge two cases together.
//Page(s) -> case -> make function to link pages together to a case. i.e merge cases.

export { initialisePage, uploadPointsToPage };


