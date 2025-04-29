"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use((0, helmet_1.default)());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Health check route
exports.app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is healthy! ✅",
    });
});
// TODO: Attach routes
//ERROR HANDLER
exports.app.use((error, req, res, next) => {
    const errorMessage = error.message || "Something went wrong";
    const errorStatus = error.status || 500;
    res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
    });
});
