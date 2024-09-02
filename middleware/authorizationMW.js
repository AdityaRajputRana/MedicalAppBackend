import "dotenv/config";
import jwt from "jsonwebtoken";
import {
  sendCustomStatus,
  sendUnauthorized,
} from "../controllers/ResponseCtrl.js";

export default async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    sendUnauthorized(
      "No Access token provided",
      "No Access token provided",
      res
    );
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      sendUnauthorized("Unauthorized", "Unauthorized", res);
      return;
    }
    req.uid = decoded.data.uid;
    req.role = decoded.data.role;
    req.hospitalId = decoded.data.hospitalId;
    const currentTime = Date.now();
    if (decoded.exp * 1000 < currentTime) {
      sendCustomStatus(
        401,
        false,
        "Token expired, please login again",
        {
          tokenExp: true,
          loginAgain: true,
          expiredAt: decoded.exp * 1000,
          issuedAt: decoded.iat * 1000,
          currentTime: currentTime,
        },
        res
      );

      return;
    }
    next();
  });
};
