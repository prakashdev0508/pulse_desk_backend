import { Response } from "express";
import { z } from "zod";

class CustomError extends Error {
  status: number;
  error: any;

  constructor(status: number,  error?: any) {
    super(status.toString());
    this.status = status;
    this.message = error;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const createError = (status: number, message: string, error?: any) => {
  if (error instanceof z.ZodError) {
    const errorMessages = error.errors.map((err) => {
      return {
        field: err.path[0],
        message: err.message,
      };
    });
    return new CustomError(status, errorMessages);
  }

  return new CustomError(status, message);
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
