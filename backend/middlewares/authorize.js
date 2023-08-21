const jwt = require("jsonwebtoken");
const { config } = require('../config');
const { sendErrorResponse } = require("../helpers/response");

function authorization(roles = []) {
    if (typeof roles == "string") {
        roles = [roles]
    }
    return function (req, res, next) {
        const token = req.headers['authorization'];
        if (!token) {
            req['user'] = {
                userId: null,
                email: null
            }
            next();
        }
        else {
            jwt.verify(token, config.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    console.log(err);
                    sendErrorResponse(res, err.message, 401);
                }
                else {
                    // console.log("Authorization success -- ", decoded);
                    req.user = decoded;
                    next();
                }
            })
        }
    }
};

module.exports = authorization