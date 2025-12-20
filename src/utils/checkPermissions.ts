import { UnauthorizedError } from "../errors";

export interface RequestUser {
  userId: string;
  role: string;
}

/**
 * Checks if the requesting user has permission to access a resource.
 * - Admins can access anything
 * - Otherwise, userId must match the resource owner's id
 */
export const checkPermissions = (
  requestUser: RequestUser,
  resourceUserId: { toString(): string } | string
): void => {
  if (requestUser.role === "admin") return;

  const resourceId =
    typeof resourceUserId === "string"
      ? resourceUserId
      : resourceUserId.toString();

  if (requestUser.userId === resourceId) return;

  throw new UnauthorizedError("Not authorized to access this route");
};
