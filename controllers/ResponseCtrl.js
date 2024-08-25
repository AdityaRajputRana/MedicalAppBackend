export default  (success, message, data, res) => {
    res.status(200)
        .send({
            success,
            message,
            data
        });
    return;
}

function sendString(success, message, data, res) {
    let out = {
        success, message, data
    }

    out = JSON.stringify(out);

    res.status(200)
        .send(out);
    return;
}

function sendError(res, err, operation) {
    let message = err.message;
    if (operation) {
        message = "Failed while " + operation + ": " + message;
    }
    res.status(200)
        .send({
            success: false,
            message: message,
            data: err
        });
    return;
}

export { sendError, sendString };
