import { saltRounds } from "../config.js";
import Staff from "../models/staff.js";
import sendReponse from "./ResponseCtrl.js";
import bcrypt from 'bcrypt';
import 'dotenv/config'
import jwt from "jsonwebtoken";

async function generateJWT(staff) {
    let data = {
        uid: staff._id,
        role: staff.type,
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

export const StaffLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let staff = await Staff.findOne({ email });
    let match = false;
    if (staff)
        match = await bcrypt.compare(password, staff.password);

    if (match) {
        let token = await generateJWT(staff);
        let data = {
            jwt: token.token,
            expiresAt: token.expiresAt,
            uid: staff._id,
            user: {
                _id: staff._id,
                email: staff.email,
                name: staff.fullName,
                displayPicture: staff.displayPicture,
                type: staff.type,
                hospital: staff.hospital.name
            }
        }
        sendReponse(true, "Login Succesfull", data, res);
    } else {
        sendReponse(false, "Email or password don't match", {}, res);
    }
}

export const StaffSignup = async (req, res) => {
    let staff = await Staff.findOne({ email: req.body.email });
    if (staff) {
        sendReponse(false, "User Already Exists", null, res);
        return;
    }
    staff = req.body;
    let pass = staff.password;
    let hashedPass = await bcrypt.hash(pass, saltRounds);
    staff.password = hashedPass;

    const mStaff = new Staff(staff);
    await mStaff.save().catch(err => sendReponse(false, err.message, err, res));
    let token = await generateJWT(staff);

    let data = {
        user: mStaff,
        uid: mStaff._id,
        jwt: token
    }
    sendReponse(true, "Staff Saved", data, res);
}
