import express from "express";
import PatientAuthRouter from "./PatientAuthRouter.js";
import patientAuthorizationMW from "../middleware/PatientAuthorizationMW.js";
import { editPatientProfile, getPatientHome, getPatientPrescriptions } from "../controllers/PatientCtrl.js";

const Router = express.Router();

Router.use("/auth", PatientAuthRouter);

Router.use(patientAuthorizationMW);
Router.post("/profile/edit", editPatientProfile);
Router.post("/home", getPatientHome);
Router.post("/cases/history", getPatientPrescriptions);

export default Router;