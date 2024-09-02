import CareGuide from "../models/careGuide.js";
import sendResponse, { sendBadRequest } from "./ResponseCtrl.js";

const addVideoGuide = async (req, res) => {
  const doctorId = req.uid;
  const hospitalId = req.hospitalId;
  const { name, description, url } = req.body;

  const careGuide = new CareGuide({
    name,
    type: "Link",
    doctorId,
    hospitalId,
    description,
    mime: "link/youtube",
    url: url,
    position: 100,
  });

  await careGuide
    .save()
    .catch((err) => sendBadRequest("Error while saving guide", err, res));
  sendResponse(true, "Video saved", { guideId: careGuide._id }, res);
};

const setGuidePosition = async (req, res) => {
  const doctorId = req.uid;
  const hospitalId = req.hospitalId;

  const { guideId, position } = req.body;

  let demotedGuide = await CareGuide.findOneAndUpdate(
    { doctorId, hospitalId, position },
    {
      $set: {
        position: 100,
      },
    }
  ).catch((err) =>
    sendBadRequest("Error while removing position of previous guide", err, res)
  );

  let promotedGuide = await CareGuide.findOneAndUpdate(
    { _id: guideId },
    {
      $set: {
        position: position,
      },
    }
  ).catch((err) => sendBadRequest("Error while promoting guide", err, res));
  if (promotedGuide) promotedGuide.position = position;
  if (demotedGuide) demotedGuide.position = 100;

  sendResponse(true, "Position updated", { promotedGuide, demotedGuide }, res);
};

const getGuidesList = async (req, res) => {
  const doctorId = req.uid;
  const hospitalId = req.hospitalId;

  let guides = await CareGuide.find({ doctorId, hospitalId })
    .sort({ position: 1 })
    .catch((err) => sendBadRequest("Error while getting guides", err, res));

  let data = {
    allGuides: guides,
  };

  sendResponse(true, "Got all guides", data, res);
};

export { addVideoGuide, getGuidesList, setGuidePosition };
