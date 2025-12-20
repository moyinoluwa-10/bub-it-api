import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./custom-api";

export class UnauthenticatedError extends CustomAPIError {
  constructor(message: string = "Authentication invalid") {
    super(message, StatusCodes.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}
