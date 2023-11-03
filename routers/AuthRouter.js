import express from 'express';
import bodyParser from 'body-parser';
import  {DoctorLogin} from "../controllers/AuthCtrl.js";

const AuthRouter = express.Router();
AuthRouter.use(bodyParser.json());

AuthRouter.post("/login", DoctorLogin);

export { AuthRouter };