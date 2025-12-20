import { Response } from "express";
import { ApiResponse } from "../types/api";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponse<T>
): Response => {
  return res.status(statusCode).json(payload);
};
