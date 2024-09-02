export default (success, message, data, res) => {
  res.status(200).send({
    success,
    message,
    data,
  });
  return;
};

function sendString(success, message, data, res) {
  let out = {
    success,
    message,
    data,
  };

  out = JSON.stringify(out);

  res.status(200).send(out);
  return;
}

function sendError(res, err, operation) {
  let message = err.message;
  if (operation) {
    message = "Failed while " + operation + ": " + message;
  }
  res.status(200).send({
    success: false,
    message: message,
    data: err,
  });
  return;
}

// Send a custom status code response
const sendCustomStatus = (statusCode, success, message, data, res) => {
  res.status(statusCode).send({
    success,
    message,
    data,
  });
  return;
};

// Send a response for created resources
const sendCreated = (message, data, res) => {
  res.status(201).send({
    success: true,
    message,
    data,
  });
  return;
};

// Send an "Unauthorized" response
const sendUnauthorized = (message, data, res) => {
  res.status(401).send({
    success: false,
    message,
    data: data ?? "Unauthorized",
  });
  return;
};

// Send a "Forbidden" response
const sendForbidden = (message, data, res) => {
  res.status(403).send({
    success: false,
    message,
    data: data ?? "Forbidden",
  });
  return;
};

// Send a "Not Found" response
const sendNotFound = (message, data, res) => {
  res.status(404).send({
    success: false,
    message,
    data: data ?? "Not Found",
  });
  return;
};

// Send a "Bad Request" response
const sendBadRequest = (message, data, res) => {
  res.status(400).send({
    success: false,
    message,
    data: data ?? "Bad Request",
  });
  return;
};

// Send an "Internal Server Error" response
const sendInternalError = (message, data, res) => {
  res.status(500).send({
    success: false,
    message,
    data: data ?? "Internal Server Error",
  });
  return;
};

export {
  sendCreated,
  sendCustomStatus,
  sendError,
  sendForbidden,
  sendInternalError,
  sendNotFound,
  sendString,
  sendUnauthorized,
  sendBadRequest,
};
