// controllers/appointmentController.js

import moment from "moment-timezone";
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
    const { patient_id, appt_date, appt_time } = req.body;
    const creator_id = req.uid;

    // Check if all required fields are provided
    if (!patient_id || !appt_date || !appt_time || !creator_id) {
      return sendBadRequest(
        "All fields are required",
        {
          missingFields: {
            patient_id: !patient_id ? "patient_id is required" : undefined,
            appt_date: !appt_date ? "appt_date is required" : undefined,
            appt_time: !appt_time ? "appt_time is required" : undefined,
            creator_id: !creator_id ? "creator_id is required" : undefined,
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
    const populatedAppointment = await savedAppointment.populate(
      "patient_id",
      "fullName lastVisit"
    );
    const appointmentData = {
      _id: populatedAppointment._id,
      patient_id: populatedAppointment.patient_id._id, // Keeping patient_id as a string
      fullName: populatedAppointment.patient_id.fullName, // Extract fullName to top level
      appt_date: populatedAppointment.appt_date,
      appt_time: populatedAppointment.appt_time,
      editor_id: populatedAppointment.editor_id || null,
      createdAt: populatedAppointment.createdAt,
    };
    sendCreated("Appointment created successfully", appointmentData, res);
  } catch (error) {
    console.error(error);
    return sendInternalError(error.message, error, res);
  }
};

// Edit Appointment
export const editAppointment = async (req, res) => {
  try {
    const { id } = req.query; // Retrieve appointment ID from query parameters
    const { patient_id, appt_date, appt_time } = req.body;
    const editor_id = req.uid; // Get editor ID from the request

    // Check if appointment ID and editor ID are provided
    if (!id || !editor_id) {
      return sendBadRequest(
        "Appointment ID and editor ID are required",
        {
          missingFields: {
            id: !id ? "Appointment ID is required" : undefined,
            editor_id: !editor_id ? "Editor ID is required" : undefined,
          },
        },
        res
      );
    }

    // Validate if `id` is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendBadRequest("Invalid appointment ID", null, res);
    }

    // Check if `patient_id` is valid, if provided
    if (patient_id && !mongoose.Types.ObjectId.isValid(patient_id)) {
      return sendBadRequest("Invalid patient_id", null, res);
    }

    // Find the existing appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendNotFound("Appointment not found", null, res);
    }

    // Update fields if provided
    if (patient_id !== undefined) appointment.patient_id = patient_id;
    if (appt_date !== undefined) appointment.appt_date = appt_date;
    if (appt_time !== undefined) appointment.appt_time = appt_time;
    appointment.editor_id = editor_id; // Assign editor ID for tracking

    // Save the updated appointment
    const updatedAppointment = await appointment.save();

    // Populate related fields (e.g., patient details)
    const populatedAppointment = await updatedAppointment.populate(
      "patient_id",
      "fullName lastVisit"
    );
    const appointmentData = {
      _id: populatedAppointment._id,
      patient_id: populatedAppointment.patient_id._id, // Keeping patient_id as a string
      fullName: populatedAppointment.patient_id.fullName, // Extract fullName to top level
      appt_date: populatedAppointment.appt_date,
      appt_time: populatedAppointment.appt_time,
      editor_id: populatedAppointment.editor_id, // Include editor ID for tracking
      createdAt: populatedAppointment.createdAt,
    };

    sendResponse(
      true,
      "Appointment updated successfully",
      appointmentData,
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
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${hours}:${formattedMinutes}`;
};

// Function to convert time to 12-hour format
const timeConverter = (time) => {
  let [hours, minutes] = time.split(":").map(Number);
  const AmPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${AmPm}`;
};

// Get Appointments
export const getAppointment = async (req, res) => {
  try {
    const { appt_date, pageNumber = 1 } = req.query;
    const formatted_date = new Date(appt_date);
    const doctor_Id = req.uid;
    const paginationLimit = 10; // Set your pagination limit here

    // Ensure pageNumber is at least 1
    const page = Math.max(1, parseInt(pageNumber));

    // Build the query
    const query = {
      creator_id: doctor_Id,
      appt_date: formatted_date,
    };

    // Count total documents for pagination purposes
    const totalCount = await Appointment.countDocuments(query);

    // Find appointments with pagination and populate patient details
    const appointment_data = await Appointment.find(query)
      .sort({ appt_time: 1 }) // Sorting by most recent
      .skip((page - 1) * paginationLimit) // Skip the appropriate number of documents
      .limit(paginationLimit) // Limit the results to the pagination limit
      .populate("patient_id", "fullName lastVisit"); // Populate only necessary fields

    // If no appointments are found
    if (!appointment_data.length) {
      return sendResponse(false, "No appointments found", [], res);
    }

    // Map over appointment data and build the final response
    const final_response = appointment_data.map((element) => ({
      _id: element._id,
      appt_date: element.appt_date, // Appointment date
      appt_time: `${timeConverter(element.appt_time)} - ${timeConverter(
        timeSlotCalculator(element.appt_time)
      )}`, // Appointment time
      patient_id: element.patient_id._id, // Populated patient id
      fullName: element.patient_id.fullName, // Populated patient name
      lastVisit: element.patient_id.lastVisit, // Populated patient last visit
      createdAt: element.createdAt,
      editor_id: element.editor_id,
    }));

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalCount / paginationLimit);

    // Structure response data for pagination
    const responseData = {
      appointments: final_response,
      totalPages,
      currentPage: page,
    };

    return sendResponse(
      true,
      "Appointments fetched successfully",
      responseData,
      res
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return sendInternalError("Failed to fetch appointments", error, res);
  }
};

//Upcoming Appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    const doctor_Id = req.uid;
    const paginationLimit = 5; // Limit to top 5 upcoming appointments
    // Get today's date without time
    const currentDate = moment.utc();
    const istNow = currentDate.tz("Asia/Kolkata");

    // Get current time in HH:mm format
    const currentTime = istNow.format("HH:mm");
    const today = istNow.startOf("day").format("YYYY-MM-DD");

    // Build the query to find upcoming appointments for today
    const query = {
      creator_id: doctor_Id,
      appt_date: today, // Appointments for today
      appt_time: { $gte: currentTime }, // Later than the current time
    };

    // Find upcoming appointments sorted by appointment time
    const upcoming_appointments = await Appointment.find(query)
      .sort({ appt_date: 1, appt_time: 1 }) // Sort by date and time
      .limit(paginationLimit) // Limit the results to 5
      .populate("patient_id", "fullName lastVisit"); // Populate only necessary fields

    // If no upcoming appointments are found
    if (!upcoming_appointments.length) {
      return sendResponse(false, "No upcoming appointments found", [], res);
    }

    // Map over upcoming appointment data and build the final response
    const final_response = upcoming_appointments.map((element) => ({
      _id: element._id,
      appt_date: element.appt_date, // Appointment date
      appt_time: `${timeConverter(element.appt_time)} - ${timeConverter(
        timeSlotCalculator(element.appt_time)
      )}`, // Appointment time
      patient_id: element.patient_id._id, // Populated patient id
      fullName: element.patient_id.fullName, // Populated patient name
      lastVisit: element.patient_id.lastVisit, // Populated patient last visit
      createdAt: element.createdAt,
      editor_id: element.editor_id,
    }));

    return sendResponse(
      true,
      "Upcoming appointments fetched successfully",
      final_response,
      res
    );
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return sendInternalError(
      "Failed to fetch upcoming appointments",
      error,
      res
    );
  }
};
