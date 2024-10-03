// controllers/appointmentController.js

import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import sendResponse, {
  sendBadRequest,
  sendCreated,
  sendInternalError,
  sendNotFound,
} from "./ResponseCtrl.js";

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { patient_id, appt_date, appt_time} = req.body;
    const creator_id = req.uid;

    // Check if all required fields are provided
    if (!patient_id || !appt_date || !appt_time || !creator_id) {
      return sendBadRequest(
        "All fields are required",
        {
          missingFields: {
            patient_id: !patient_id ? 'patient_id is required' : undefined,
            appt_date: !appt_date ? 'appt_date is required' : undefined,
            appt_time: !appt_time ? 'appt_time is required' : undefined,
            creator_id: !creator_id ? 'creator_id is required' : undefined,
          },
        },
        res
      );
    }

    // Check if `patient_id` and `creator_id` are valid Mongo ObjectIds
    if (!mongoose.Types.ObjectId.isValid(patient_id)) {
      return sendBadRequest("Invalid patient_id", null, res);
    }

    if (!mongoose.Types.ObjectId.isValid(creator_id)) {
      return sendBadRequest("Invalid creator_id", null, res);
    }
    const newAppointment = new Appointment({
      patient_id,
      appt_date,
      appt_time,
      creator_id,
    });

    const savedAppointment = await newAppointment.save();
    sendCreated("Appointment created successfully", savedAppointment, res);
  } catch (error) {
    console.error(error);
    return sendInternalError(error.message, error, res);
  }
};

// Edit Appointment
export const editAppointment = async (req, res) => {
  try {
    const { id } = req.query; // Retrieve id from query parameters
    const { patient_id, appt_date, appt_time, uid } = req.body;

    if (!id) {
      return sendBadRequest(
        "Appointment ID is required",
        "Appointment ID is required",
        res
      );
    }
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendNotFound(
        "Appointment not found",
        "Appointment not found",
        res
      );
    }

    // Update fields
    if (patient_id !== undefined) appointment.patient_id = patient_id;
    if (appt_date !== undefined) appointment.appt_date = appt_date;
    if (appt_time !== undefined) appointment.appt_time = appt_time;
    if (uid !== undefined) appointment.creator_id = uid;

    const updatedAppointment = await appointment.save();
    return sendReponse(
      true,
      "Appointment updated successfully",
      updatedAppointment,
      res
    );
  } catch (error) {
    console.error(error);
    return sendInternalError(error.message, error, res);
  }
};

// Delete Appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.query; // Retrieve id from query parameters

    if (!id) {
      return sendBadRequest(
        "Appointment ID is required",
        "Appointment ID is required",
        res
      );
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendNotFound(
        "Appointment not found",
        "Appointment not found",
        res
      );
    }

    await appointment.remove();
    return sendReponse(true, "Appointment deleted successfully", {}, res);
  } catch (error) {
    console.error(error);
    return sendInternalError(error.message, error, res);
  }
};

// function to find the time slot for next 30 minutes
const timeSlotCalculator = (startTime) => {
  let [hours, minutes] = startTime.split(":").map(Number);
  minutes += 30;
  if (minutes >= 60) {
    minutes -= 60;
    hours += 1;
  }
  // Pad minutes to ensure double digits (e.g., 09 instead of 9)
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${hours}:${formattedMinutes}`;
}

// Function to convert time to 12-hour format
const timeConverter = (time) => {
  let [hours, minutes] = time.split(":").map(Number);
  const AmPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${AmPm}`;
}


// Get Appointments
export const getAppointment = async (req, res) => {
  try {
    const { appt_date } = req.query;
    const formatted_date = new Date(appt_date); 
    const doctor_Id = req.uid;

    // Find appointments and populate patient details
    const appointment_data = await Appointment.find({
      creator_id: doctor_Id,
      appt_date: formatted_date,
    }).populate('patient_id', 'fullName lastVisit'); // Populate only necessary fields

    console.log("Appointment data:", appointment_data);
    
    // If no appointments are found
    if (!appointment_data.length) {
      return sendResponse(false, "No appointments found", [], res);
    }
    // Map over appointment data and build the final response
    const final_response = appointment_data.map((element) => ({
      _id:element._id,
      appt_time: `${timeConverter(element.appt_time)} - ${timeConverter(timeSlotCalculator(element.appt_time))}`, // Appointment time
      patient_id: element.patient_id._id, // Populated patient id
      full_name: element.patient_id.fullName, // Populated patient name
      lastVisit: element.patient_id.lastVisit, // Populated patient last visit
      createdAt:element.createdAt,
    }));

    return sendResponse(true, "Appointments fetched successfully", final_response, res);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return sendInternalError("Failed to fetch appointments", error, res); // Improved error handling
  }
};