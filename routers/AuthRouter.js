import express from 'express';
import bodyParser from 'body-parser';
import  {StaffLogin, StaffSignup} from "../controllers/AuthCtrl.js";

const AuthRouter = express.Router();
AuthRouter.use(express.json());

AuthRouter.post("/login", StaffLogin);
AuthRouter.post("/signUpStaff", StaffSignup);

export { AuthRouter };