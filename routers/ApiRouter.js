import express from 'express';
import multer from 'multer';
import { createAppointment, deleteAppointment, editAppointment, getAppointment } from '../controllers/ApptCtrl.js';
import { generateCasePDF, getCasesHistory, mergeCases, submitCase, viewCase } from '../controllers/CaseCtrl.js';
import { addNewPatient, getHome, getPageConfig, getPageConfigMetadata, getPatientHistory, updatePageConfigMetadata, viewPatient } from '../controllers/DoctorCtrl.js';
import { addVideoGuide, getGuidesList, setGuidePosition } from '../controllers/GuideCtrl.js';
import '../controllers/PageCtrl.js';
import { addAdditional, addDetails, addMobileNumber, changeCase, getPage, initialisePage, linkGuide, linkPage, uploadPointsToPage } from '../controllers/PageCtrl.js';
import AuthorizationMW from '../middleware/authorizationMW.js';

const APIRouter = express.Router();
APIRouter.use(AuthorizationMW);

const upload = multer({ dest: 'uploads/' });

APIRouter.post("/home", getHome);
APIRouter.post("/doctor/getPageConfig", getPageConfig);
APIRouter.post("/doctor/getPageConfigMetadata", getPageConfigMetadata)
APIRouter.post("/doctor/updatePageConfigMetadata", updatePageConfigMetadata)

APIRouter.post("/guides/addVideo", addVideoGuide);
APIRouter.post("/guides/setPosition", setGuidePosition);
APIRouter.post("/guides/list", getGuidesList);

//chained the api routes
APIRouter.post('/appointments', createAppointment)
.put('/appointments', editAppointment)
.delete('/appointments', deleteAppointment)
.get("/appointments", getAppointment);


APIRouter.post("/page/initialize", initialisePage);
APIRouter.post("/page/addPoints", uploadPointsToPage);
APIRouter.post("/page/addDetails", addDetails);
APIRouter.post("/page/changeCase", changeCase); //Todo
APIRouter.post("/page/addMobileNumber", addMobileNumber);
APIRouter.post("/page/view", getPage);
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
APIRouter.post("/patients/add", addNewPatient);


export { APIRouter };
