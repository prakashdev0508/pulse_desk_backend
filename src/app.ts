import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";

config();

export const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy! ✅",
  });
});


// TODO: Attach routes

//ERROR HANDLER
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorMessage = error.message || "Something went wrong";
  const errorStatus = (error as any).status || 500;

  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
  });
});