import crypto from "crypto";
import { User } from "../user/user.model";
import { Token } from "./token.model";
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  AuthUserPayload,
} from "./auth.dto";
import { UnauthenticatedError, UnauthorizedError } from "../../errors";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
} from "../../utils/emails";
import { verifyRefreshToken } from "../../utils/jwt";
import { hashValue, compareHash } from "../../utils/hash";
import { AuthenticatedRequest } from "../../middleware/auth";
import { assertOrBadRequest } from "../../utils/assert";
import { env } from "../../config/env";
import logger from "../../lib/winston-logger";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const ORIGIN = env.FRONTEND_URL;

export const authService = {
  async signup(body: SignupRequest): Promise<SignupResponse> {
    const { email, password } = body;

    assertOrBadRequest(email && password, "Please provide all values");

    const normalizedEmail = normalizeEmail(email);

    const existing = await User.findOne({ email });
    assertOrBadRequest(!existing, "Email already in use");

    assertOrBadRequest(
      password.length >= 8,
      "Password must be at least 8 characters"
    );

    const verificationToken = crypto.randomBytes(70).toString("hex");
    const verificationTokenHash = await hashValue(verificationToken);

    const createdUser = await User.create({
      email: normalizedEmail,
      password,
      verificationToken: verificationTokenHash,
    });

    try {
      const verificationLink = `${ORIGIN}/auth/verify-email?email=${encodeURIComponent(
        normalizedEmail
      )}&token=${verificationToken}`;
      await sendVerificationEmail({
        email: normalizedEmail,
        verificationLink,
      });
    } catch (err) {
      logger.error({ message: "Error sending verification email", error: err });
    }

    return {
      user: {
        id: createdUser._id.toString(),
        email: createdUser.email,
        role: createdUser.role,
      },
    };
  },

  async resendVerification(email: string): Promise<{ wasResent: boolean }> {
    assertOrBadRequest(email, "Please provide your email.");

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    assertOrBadRequest(user, "Email not found");

    if (user.isVerified) {
      return {
        wasResent: false,
      };
    }

    const verificationToken = crypto.randomBytes(70).toString("hex");
    const verificationTokenHash = await hashValue(verificationToken);

    user.verificationToken = verificationTokenHash;
    await user.save();

    const verificationLink = `${ORIGIN}/auth/verify-email?email=${encodeURIComponent(
      normalizedEmail
    )}&token=${verificationToken}`;
    await sendVerificationEmail({
      email: user.email,
      verificationLink,
    });
    return {
      wasResent: true,
    };
  },

  async verifyEmail(email: string, token: string): Promise<void> {
    assertOrBadRequest(email && token, "Please provide all values");

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    assertOrBadRequest(user, "Verification Failed");

    if (user.isVerified) return;

    assertOrBadRequest(
      await compareHash(token, user.verificationToken!),
      "Verification Failed"
    );

    user.isVerified = true;
    user.verified = new Date();
    user.verificationToken = null;
    await user.save();
  },

  async login(
    req: AuthenticatedRequest,
    body: LoginRequest
  ): Promise<LoginResponse> {
    const { email, password } = body || ({} as LoginRequest);
    assertOrBadRequest(email && password, "Please provide email and password.");

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      throw new UnauthenticatedError("Incorrect email or password");
    }

    if (!user.isVerified) {
      throw new UnauthorizedError("Email not verified");
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      throw new UnauthenticatedError("Incorrect email or password");
    }

    const userPayload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // create refresh token
    let refreshToken = "";
    // check for existing token
    const existingToken = await Token.findOne({ userId: user._id });

    if (existingToken) {
      const { isValid } = existingToken;
      if (isValid) {
        const refreshToken = crypto.randomBytes(70).toString("hex");
        const refreshTokenHash = await hashValue(refreshToken);
        existingToken.refreshTokenHash = refreshTokenHash;
        await existingToken.save();
        return { user: userPayload, refreshToken };
      }
      await existingToken.deleteOne();
    }

    refreshToken = crypto.randomBytes(70).toString("hex");
    const refreshTokenHash = await hashValue(refreshToken);
    const userAgent = req.get("user-agent") || "unknown";
    const ip = req.ip || (req.socket as any)?.remoteAddress || "unknown";
    const userToken = { refreshTokenHash, ip, userAgent, userId: user._id };

    await Token.create(userToken);

    return {
      user: userPayload,
      refreshToken,
    };
  },

  async logout(req: AuthenticatedRequest): Promise<void> {
    try {
      const { refreshToken } = req.signedCookies ?? {};
      if (!refreshToken) return;

      const { userId } = verifyRefreshToken(refreshToken);
      await Token.findOneAndDelete({ userId });
    } catch {
      // ignore verification errors for logout (idempotent)
    }
  },

  async forgotPassword(email: string): Promise<void> {
    assertOrBadRequest(email, "Please provide your email.");

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const resetToken = crypto.randomBytes(70).toString("hex");
      const resetLink = `${ORIGIN}/auth/reset-password?email=${encodeURIComponent(
        normalizedEmail
      )}&token=${resetToken}`;
      await sendForgotPasswordEmail({
        email: user.email,
        resetLink,
      });

      const fifteenMinutes = 1000 * 60 * 15;
      user.passwordToken = await hashValue(resetToken);
      user.passwordTokenExpirationDate = new Date(Date.now() + fifteenMinutes);
      await user.save();
    }
  },

  async resetPassword(
    email: string,
    password: string,
    token: string
  ): Promise<void> {
    assertOrBadRequest(email && password && token, "Please provide all values");

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // still respond success later to avoid enumeration
      return;
    }

    const currentDate = new Date();
    if (
      (await compareHash(token, user.passwordToken!)) &&
      user.passwordTokenExpirationDate &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
      return;
    }

    throw new UnauthenticatedError("Verification Failed");
  },
};
