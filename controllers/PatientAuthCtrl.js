import Patient from "../models/patient.js";
import sendResponse, { sendError } from "./ResponseCtrl.js";
import 'dotenv/config'
import jwt from "jsonwebtoken";

async function generateJWT(staff) {
    let data = {
        uid: staff._id,
        role: "patient",
        phone: staff.phoneNumber
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
            .catch(err => sendError(res, err, "Creting new user"));
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
        sendResponse(false, "Provide phone number and otp to verify", null, res);
        return;
    }

    const user = await Patient.findOne({mobileNumber:phoneNumber});
    if (!user){
        sendResponse(false, "User not found", "", res);
        return;
    }

    if (user.loginAttempt == null){
        sendResponse(false, "Login was not initiated!", "", res);
        return;
    }

    if((Date.now() - user.loginAttempt.timestamp)/1000 > 180){
        sendResponse(false, "OTP has expired!", "", res);
        return;
    }

    if (otp != user.loginAttempt.otp){
        sendResponse(false, "Wrong OTP, try again", "", res);
        return;
    }

    user.loginAttempt = null;
    if (user.isNewUser == null || user.isNewUser == undefined){
        user.isNewUser = true;
    }
    await user.save();
    //Todo: send only the field reqired

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
            type: "Patient"
        }
    }
    sendResponse(true, "OTP verified successfully! Welcome to the app", data, res);
    return;
}

