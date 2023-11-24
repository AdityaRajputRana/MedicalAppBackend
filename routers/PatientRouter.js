import express from "express";
import PatientAuthRouter from "./PatientAuthRouter.js";

const Router = express.Router();

Router.use("/auth", PatientAuthRouter);


export default Router;