"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccess = exports.createError = void 0;
const zod_1 = require("zod");
const errors_1 = require("./errors");
const createError = (status, message, error) => {
    if (error instanceof zod_1.z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
            field: err.path[0],
            message: err.message,
        }));
        return new errors_1.ValidationError(JSON.stringify({
            message: "Validation Error",
            error: formattedErrors
        }));
    }
    return new errors_1.AppError(status, message);
};
exports.createError = createError;
const createSuccess = (res, message, data, status) => {
    return res
        .status(status ? status : 200)
        .json({ success: true, message: message, data });
};
exports.createSuccess = createSuccess;
