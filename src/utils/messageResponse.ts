import { Response } from "express";
import { z } from "zod";
import { AppError, ValidationError } from "./errors";

export const createError = (status: number, message: string, error?: any) => {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));
    return new ValidationError(JSON.stringify({
      message: "Validation Error",
      error: formattedErrors
    }));
  }

  return new AppError(status, message);
};

export const createSuccess = (
  res: Response,
  message: string,
  data?: any,
  status?: number
) => {
  return res
    .status(status ? status : 200)
    .json({ success: true, message: message, data });
};
