import 'dotenv/config';
import jwt from "jsonwebtoken";
import Patient from "../models/patient.js";
import sendResponse, { sendBadRequest, sendNotFound } from "./ResponseCtrl.js";

async function generateJWT(staff) {
    let data = {
        uid: staff._id,
        role: "patient",
        mobileNumber: staff.mobileNumber
    }

    const expiresIn = 7 * 24 * 60 * 60;

    const currentTimestamp = Date.now();
    let expiresAt = currentTimestamp + expiresIn * 1000;
    expiresAt = expiresAt/1000;

    let token = await jwt.sign({ data }, process.env.JWT_SECRET, { expiresIn });
    expiresAt *= 1000;
    return {
        token, expiresAt
    }
}

export const loginWithPhoneAndOTP = async (req, res) => {

    let phoneNumber = req.body.mobileNumber;
    if (!phoneNumber) {
        sendResponse(false, "Phone number not provided!", null, res);
        return;
    }
    if (phoneNumber.toString().length != 10){
        sendResponse(false, "Phone number shall be of 10 digits",null, res);
        return;
    }

    //Todo: generate and send a random OTP here
    let otp = 111111;
    const user = await Patient.findOne({ mobileNumber: phoneNumber });
    
    if (!user){
        let newUser = new Patient({
            isAnonymous: false,
            mobileNumber:phoneNumber,
            isNewUser: true,
            loginAttempt:{
                otp:otp,
                timestamp:Date.now()
            }

        })
        await newUser.save()
            .catch(err => sendBadRequest("Error while creating user", err, res));
    } else {
        user.loginAttempt = {
                otp:otp,
                timestamp:Date.now()
        }
        await user.save();
    }
    let data = {
        phoneNumber: phoneNumber,
        otpExpireTime: 180
    }

    sendResponse(true, "OTP sent successfully", data, res);
}

export const verifyOTP = async (req, res) =>{
    let phoneNumber = req.body.mobileNumber;
    let otp = req.body.otp;

    if (!phoneNumber || !otp) {
        sendBadRequest("Provide phone number and otp to verify", "Provide phone number and otp to verify", res);
        return;
    }

    const user = await Patient.findOne({mobileNumber:phoneNumber});
    if (!user){
        sendNotFound("User not found", "User not found", res);
        return;
    }

    if (user.loginAttempt == null){
        sendBadRequest("Login attempt not initiated", "Login attempt not initiated", res);
        return;
    }

    if((Date.now() - user.loginAttempt.timestamp)/1000 > 180){
        sendBadRequest("OTP has expired!", "OTP has expired!", res);
        return;
    }

    if (otp != user.loginAttempt.otp){
        sendBadRequest("Wrong OTP, try again", "Wrong OTP, try again", res);
        return;
    }

    user.loginAttempt = null;
    if (user.isNewUser == null || user.isNewUser == undefined){
        user.isNewUser = true;
    }
    await user.save();

    let token = await generateJWT(user);
    let data = {
        jwt: token.token,
        expiresAt: token.expiresAt,
        uid: user._id,
        user: {
            _id: user._id,
            isNewUser: user.isNewUser,
            name: user.fullName,
            displayPicture: user.displayPicture,
            gender: user.gender,
            type: "Patient"
        }
    }
    sendResponse(true, "OTP verified successfully! Welcome to the app", data, res);
    return;
}

