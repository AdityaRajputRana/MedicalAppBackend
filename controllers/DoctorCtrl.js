import Staff from "../models/staff.js";
import sendReponse from "./ResponseCtrl.js";
import 'dotenv/config'


export const getHome = async (req, res) => {

    let data = {
        naam: "Bhupendar Jogi",
        americaMeKahaGhoomeHo: "Bohot jagah",
        naamBatayiye: "Bhupendar Jogi"
    }
    sendReponse(true, "Home fetched", data, res);
}

export const getPatientHistory = async (req, res) => {
    let data = {
        naam: "Bhupendar Jogi",
        americaMeKahaGhoomeHo: "Bohot jagah",
        naamBatayiye: "Bhupendar Jogi"
    }
    sendReponse(true, "His fetched", data, res);
}
