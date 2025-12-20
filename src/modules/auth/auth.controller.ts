import { Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AuthenticatedRequest } from "../../middleware/auth";
import { SignupRequest, LoginRequest } from "./auth.dto";
import { StatusCodes } from "http-status-codes";
import { cookiesConfig } from "../../config/cookies";
import { attachCookiesToResponse } from "../../utils/attachCookies";

export const signup = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as SignupRequest;
    const result = await authService.signup(body);

    sendResponse(res, StatusCodes.CREATED, {
      success: true,
      message: "Signup successful. Please verify your email.",
      data: result,
    });
  }
);

export const resendVerification = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body as { email: string };
    const result = await authService.resendVerification(email);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: result.wasResent
        ? "Verification code resent successfully"
        : "Email is already verified",
    });
  }
);

export const verifyEmail = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, token } = req.body as { email: string; token: string };
    await authService.verifyEmail(email, token);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Email verified successfully",
    });
  }
);

export const login = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as LoginRequest;
    const result = await authService.login(req, body);
    attachCookiesToResponse({
      res,
      user: result.user,
      refreshToken: result.refreshToken,
    });

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Login successful",
      data: { user: result.user },
    });
  }
);

export const logout = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await authService.logout(req);

    res.cookie("accessToken", "loggedOut", cookiesConfig(1000));
    res.cookie("refreshToken", "loggedOut", cookiesConfig(1000));

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Logged out.",
    });
  }
);

export const forgotPassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body as { email: string };
    await authService.forgotPassword(email);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Password reset email sent successfully",
    });
  }
);

export const resetPassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password, token } = req.body as {
      email: string;
      password: string;
      token: string;
    };

    await authService.resetPassword(email, password, token);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Password reset successfully",
    });
  }
);
