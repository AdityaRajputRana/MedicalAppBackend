export default  (success, message, data, res) => {
    res.status(200)
        .send({
            success,
            message,
            data
        });
    return;
}