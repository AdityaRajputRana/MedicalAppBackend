import express from 'express';
import { loginWithPhoneAndOTP, verifyOTP } from '../controllers/PatientAuthCtrl.js';

const Router = express.Router();

Router.post("/login", loginWithPhoneAndOTP);
Router.post("/verify", verifyOTP);

export default Router;