import express from "express";
import PatientAuthRouter from "./PatientAuthRouter.js";
import patientAuthorizationMW from "../middleware/patientAuthorizationMW.js";
import { editPatientProfile } from "../controllers/PatientCtrl.js";

const Router = express.Router();

Router.use("/auth", PatientAuthRouter);

Router.use(patientAuthorizationMW);
Router.post("/profile/edit", editPatientProfile);

export default Router;