import express from 'express';
import { StaffLogin, StaffSignup } from "../controllers/AuthCtrl.js";

const AuthRouter = express.Router();

AuthRouter.post("/login", StaffLogin);
AuthRouter.post("/signUpStaff", StaffSignup);

export { AuthRouter };
