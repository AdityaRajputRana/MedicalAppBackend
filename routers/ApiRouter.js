import express from 'express';
import { getHome, getPatientHistory } from '../controllers/DoctorCtrl.js';
import '../controllers/PageCtrl.js'
import AuthorizationMW from '../middleware/authorizationMW.js';
import { addDetails, initialisePage, uploadPointsToPage, changeCase, addMobileNumber, linkPage } from '../controllers/PageCtrl.js';
import { getCasesHistory, mergeCases, submitCase, viewCase } from '../controllers/CaseCtrl.js';

const APIRouter = express.Router();
APIRouter.use(AuthorizationMW);

APIRouter.post("/home", getHome);
APIRouter.post("/page/initialize", initialisePage);
APIRouter.post("/page/addPoints", uploadPointsToPage);
APIRouter.post("/page/addDetails", addDetails);
APIRouter.post("/page/changeCase", changeCase); //Todo
APIRouter.post("/page/addMobileNumber", addMobileNumber);
APIRouter.post("/page/link", linkPage);

APIRouter.post("/case/merge", mergeCases); 
APIRouter.post("/case/history", getCasesHistory);
APIRouter.post("/case/submit", submitCase);
APIRouter.post("/case/view", viewCase);

APIRouter.post("/patients/list", getPatientHistory);


export { APIRouter };