import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "../errors";
import { env } from "../config/env";
import logger from "../lib/winston-logger";

interface MongooseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  value?: unknown;
  name: string;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (env.NODE_ENV === "development") {
    logger.error(err);
  }

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong, please try again later";

  // 1) CustomAPIError and its subclasses
  if (err instanceof CustomAPIError) {
    statusCode = err.statusCode;
    message = err.message || message;
  }

  const maybeMongooseErr = err as MongooseError;

  // 2) Mongoose ValidationError
  if (maybeMongooseErr.name === "ValidationError" && maybeMongooseErr.errors) {
    message = Object.values(maybeMongooseErr.errors)
      .map((item) => item.message)
      .join(", ");
    statusCode = StatusCodes.BAD_REQUEST;
  }

  // 3) Mongoose duplicate key error (code 11000)
  if (
    maybeMongooseErr.code &&
    maybeMongooseErr.code === 11000 &&
    maybeMongooseErr.keyValue
  ) {
    const fields = Object.keys(maybeMongooseErr.keyValue).join(", ");
    message = `Duplicate value entered for ${fields} field, please choose another value`;
    statusCode = StatusCodes.BAD_REQUEST;
  }

  // 4) Mongoose CastError (invalid ObjectId, etc.)
  if (maybeMongooseErr.name === "CastError" && maybeMongooseErr.value) {
    message = `No item found with id: ${maybeMongooseErr.value}`;
    statusCode = StatusCodes.NOT_FOUND;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
