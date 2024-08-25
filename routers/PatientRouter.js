import express from "express";
import { editPatientProfile, getPatientHome, getPatientPrescriptions, viewCase } from "../controllers/PatientCtrl.js";
import patientAuthorizationMW from "../middleware/PatientAuthorizationMW.js";
import PatientAuthRouter from "./PatientAuthRouter.js";

const Router = express.Router();

Router.use("/auth", PatientAuthRouter);

Router.use(patientAuthorizationMW);
Router.post("/profile/edit", editPatientProfile);
Router.post("/home", getPatientHome);
Router.post("/cases/history", getPatientPrescriptions);
Router.post("/cases/view", viewCase);

export default Router;