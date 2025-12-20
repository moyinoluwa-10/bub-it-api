import { BadRequestError, CustomAPIError } from "../errors";

/**
 * Throws the provided error if the condition is false.
 */
export function assert(
  condition: unknown,
  error: CustomAPIError
): asserts condition {
  if (!condition) {
    throw error;
  }
}

export function assertOrBadRequest(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new BadRequestError(message);
  }
}

export function invariant(
  condition: unknown,
  message: string,
  ErrorType: new (msg: string) => CustomAPIError = BadRequestError
): asserts condition {
  if (!condition) {
    throw new ErrorType(message);
  }
}
