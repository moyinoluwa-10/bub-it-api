import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./custom-api";

export class UnauthorizedError extends CustomAPIError {
  constructor(message: string = "Not authorized to access this route") {
    super(message, StatusCodes.FORBIDDEN);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
