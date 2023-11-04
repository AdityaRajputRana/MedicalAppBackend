import 'dotenv/config'
import jwt from "jsonwebtoken";
import sendResponse from "../controllers/ResponseCtrl.js";

export default async (req, res, next) => {
   let token = req.headers["x-access-token"];

    if (!token) {
        sendResponse(false, "No Access token provided", [], res);
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET,
                (err, decoded) => {
                    if (err) {
                        sendResponse(false, "Unauthorized", {}, res);
                        return;
                    }
                    req.uid = decoded.data.uid;
                    req.role = decoded.data.role;
                    const currentTime = Date.now();
                    if (decoded.exp*1000 < currentTime) {
                        sendResponse(false, "Token expired, please login again", {
                            tokenExp: true,
                            loginAgain: true,
                            expiredAt: decoded.exp * 1000,
                            issuedAt: decoded.iat * 1000,
                            currentTime: currentTime
                        }, res);
                        return;
                    } else {
                        sendResponse(true, "token valid", {
                            tokenExp: true,
                            loginAgain: true,
                            expiredAt: decoded.exp * 1000,
                            issuedAt: decoded.iat * 1000,
                            currentTime: currentTime
                        }, res);
                        return;
                    }
                    next();
                });
}