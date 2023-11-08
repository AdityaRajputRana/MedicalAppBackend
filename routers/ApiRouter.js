import express from 'express';
import { getHome } from '../controllers/DoctorCtrl.js';
import '../controllers/PageCtrl.js'
import AuthorizationMW from '../middleware/authorizationMW.js';
import { addDetails, initialisePage, uploadPointsToPage, changeCase } from '../controllers/PageCtrl.js';
import { getCasesHistory, mergeCases } from '../controllers/CaseCtrl.js';

const APIRouter = express.Router();
APIRouter.use(AuthorizationMW);

APIRouter.post("/home", getHome);
APIRouter.post("/page/initialize", initialisePage);
APIRouter.post("/page/addPoints", uploadPointsToPage);
APIRouter.post("/page/addDetails", addDetails);
APIRouter.post("/page/changeCase", changeCase); //Todo

APIRouter.post("/case/merge", mergeCases); //Todo
APIRouter.post("/case/history", getCasesHistory) //Todo

export { APIRouter };