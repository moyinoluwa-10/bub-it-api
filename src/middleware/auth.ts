import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenUser, verifyRefreshToken } from "../utils/jwt";
import { UnauthenticatedError, UnauthorizedError } from "../errors";
import { Token } from "../modules/auth/token.model";
import { attachCookiesToResponse } from "../utils/attachCookies";
import { compareHash, hashValue } from "../utils/hash";

export interface AuthenticatedRequest extends Request {
  user?: TokenUser;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken, accessToken } = req.signedCookies ?? {};

    // If access token is valid, we’re done.
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      req.user = payload;
      return next();
    }

    //  No access token; require refresh token.
    if (!refreshToken) throw new UnauthenticatedError("Authentication invalid");

    // Verify refresh token with refresh secret.
    const payload = verifyRefreshToken(refreshToken);

    // Validate token record exists and is valid.
    const existingToken = await Token.findOne({
      userId: payload.userId,
      isValid: true,
    });

    if (
      !existingToken ||
      !(await compareHash(
        payload.refreshToken!,
        existingToken.refreshTokenHash
      ))
    )
      throw new UnauthenticatedError("Authentication invalid");

    // Optionally re-issue access token cookies here (sliding sessions)
    attachCookiesToResponse({
      res,
      user: {
        userId: payload.userId,
        role: payload.role,
      },
      refreshToken: payload.refreshToken!,
    });
    req.user = payload;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const optionalAuthentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accessToken, refreshToken } = req.signedCookies ?? {};

    if (accessToken) {
      req.user = verifyAccessToken(accessToken);
      return next();
    }

    if (!refreshToken) return next();

    const payload = verifyRefreshToken(refreshToken);

    const existingToken = await Token.findOne({
      userId: payload.userId,
      isValid: true,
    });

    if (
      !existingToken ||
      !(await compareHash(
        payload.refreshToken!,
        existingToken.refreshTokenHash
      ))
    )
      return next();

    attachCookiesToResponse({
      res,
      user: {
        userId: payload.userId,
        role: payload.role,
      },
      refreshToken: payload.refreshToken!,
    });

    req.user = payload;
    return next();
  } catch {
    return next();
  }
};

export const authorizePermissions =
  (...roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthenticatedError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }

    next();
  };
