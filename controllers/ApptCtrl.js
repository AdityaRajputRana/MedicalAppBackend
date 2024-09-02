// controllers/appointmentController.js

import Appointment from "../models/appointment.js";
import sendReponse, {
  sendBadRequest,
  sendCreated,
  sendInternalError,
  sendNotFound,
} from "./ResponseCtrl.js";

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { patient_id, appt_date, appt_time, creator_id } = req.body;

    if (!patient_id || !appt_date || !appt_time || !creator_id) {
      return res.status(400).json({ message: "All fields are required" });
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
    const { patient_id, appt_date, appt_time, creator_id } = req.body;

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
    if (creator_id !== undefined) appointment.creator_id = creator_id;

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
