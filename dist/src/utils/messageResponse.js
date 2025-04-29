"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccess = exports.createError = void 0;
const zod_1 = require("zod");
class CustomError extends Error {
    constructor(status, message, error) {
        super(message);
        this.status = status;
        this.error = error;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
const createError = (status, message, error) => {
    if (error instanceof zod_1.z.ZodError) {
        const errorMessages = error.errors.map((err) => {
            return {
                field: err.path[0],
                message: err.message,
            };
        });
        return new CustomError(status, message, errorMessages);
    }
    return new CustomError(status, message, error);
};
exports.createError = createError;
const createSuccess = (res, message, data, status) => {
    return res
        .status(status ? status : 200)
        .json({ success: true, message: message, data });
};
exports.createSuccess = createSuccess;
