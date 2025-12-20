import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors";

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new NotFoundError(`Route does not exist: ${req.originalUrl}`));
};
