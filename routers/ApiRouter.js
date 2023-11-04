import express from 'express';
import { getHome } from '../controllers/DoctorCtrl.js';
import AuthorizationMW from '../middleware/authorizationMW.js';

const APIRouter = express.Router();
APIRouter.use(AuthorizationMW);

APIRouter.post("/home", getHome);

export { APIRouter };