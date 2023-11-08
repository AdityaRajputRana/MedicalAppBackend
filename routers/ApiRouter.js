import express from 'express';
import { getHome } from '../controllers/DoctorCtrl.js';
import '../controllers/PageCtrl.js'
import AuthorizationMW from '../middleware/authorizationMW.js';
import { addDetails, initialisePage, uploadPointsToPage } from '../controllers/PageCtrl.js';

const APIRouter = express.Router();
APIRouter.use(AuthorizationMW);

APIRouter.post("/home", getHome);
APIRouter.post("/page/initialize", initialisePage);
APIRouter.post("/page/addPoints", uploadPointsToPage);
APIRouter.post("/page/addDetails", addDetails);

export { APIRouter };