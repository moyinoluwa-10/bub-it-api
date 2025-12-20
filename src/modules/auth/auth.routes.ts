import { Router } from "express";
import {
  signup,
  resendVerification,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", signup);

authRouter.post("/resend-verification", resendVerification);

authRouter.post("/verify-email", verifyEmail);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password", resetPassword);
