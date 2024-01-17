import express from 'express';
import { getHome, getPageConfig, getPatientHistory, viewPatient } from '../controllers/DoctorCtrl.js';
import '../controllers/PageCtrl.js'
import AuthorizationMW from '../middleware/authorizationMW.js';
import { addDetails, initialisePage, uploadPointsToPage, changeCase, addMobileNumber, linkPage, addAdditional, linkGuide } from '../controllers/PageCtrl.js';
import { generateCasePDF, getCasesHistory, mergeCases, submitCase, viewCase } from '../controllers/CaseCtrl.js';
import multer from 'multer';
import { addVideoGuide, getGuidesList, setGuidePosition } from '../controllers/GuideCtrl.js';

const APIRouter = express.Router();
APIRouter.use(AuthorizationMW);

const upload = multer({ dest: 'uploads/' });

APIRouter.post("/home", getHome);
APIRouter.post("/doctor/getPageConfig", getPageConfig);

APIRouter.post("/guides/addVideo", addVideoGuide);
APIRouter.post("/guides/setPosition", setGuidePosition);
APIRouter.post("/guides/list", getGuidesList);


APIRouter.post("/page/initialize", initialisePage);
APIRouter.post("/page/addPoints", uploadPointsToPage);
APIRouter.post("/page/addDetails", addDetails);
APIRouter.post("/page/changeCase", changeCase); //Todo
APIRouter.post("/page/addMobileNumber", addMobileNumber);
APIRouter.post("/page/link", linkPage);
APIRouter.post("/page/additional/upload", upload.single('file'), addAdditional);
APIRouter.post("/page/additional/linkGuide", linkGuide);


APIRouter.post("/case/merge", mergeCases); 
APIRouter.post("/case/history", getCasesHistory);
APIRouter.post("/case/submit", submitCase);
APIRouter.post("/case/generatePDF", generateCasePDF);
APIRouter.post("/case/view", viewCase);

APIRouter.post("/patients/list", getPatientHistory);
APIRouter.post("/patients/view", viewPatient);


export { APIRouter };