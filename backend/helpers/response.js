
let sendErrorResponse = (res, message, status_code, data = null) => {
    let response = {
        error: true,
        status_code: status_code || 200,
        message: message,
    };
    if (data != null || data != undefined) {
        response['data'] = data
    }
    res.send(response)
}


let sendSuccessResponse = (res, message, status_code, data = null, metadata = null) => {
    let response = {
        error: false,
        status_code: status_code || 200,
        message: message
    };
    if (data) {
        response['data'] = data
    }
    if (metadata != null || metadata != undefined) {
        response['metadata'] = metadata
    }
    res.send(response)
}

module.exports = {
    sendErrorResponse: sendErrorResponse,
    sendSuccessResponse: sendSuccessResponse
}