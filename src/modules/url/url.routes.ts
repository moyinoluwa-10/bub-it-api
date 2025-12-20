import { Router } from "express";
import {
  createUrl,
  deleteUrl,
  disableUrl,
  enableUrl,
  generateQrcode,
  getAllUrls,
  getAUrl,
  getUserUrls,
} from "./url.controller";
import {
  authenticateUser,
  authorizePermissions,
  optionalAuthentication,
} from "../../middleware/auth";

export const urlRouter = Router();

// Anonymous can create short urls (optional auth)
urlRouter.post("/", optionalAuthentication, createUrl);

// Public (or admin-only) listing - choose what you want
urlRouter.get("/", authenticateUser, authorizePermissions("admin"), getAllUrls);

// User-specific (must be logged in)
urlRouter.get("/me", authenticateUser, getUserUrls);

// CRUD operations (must be logged in + owner/admin by checkPermissions)
urlRouter.get("/:id", authenticateUser, getAUrl);
urlRouter.delete("/:id", authenticateUser, deleteUrl);

urlRouter.post("/:id/qrcode", authenticateUser, generateQrcode);
urlRouter.patch("/:id/enable", authenticateUser, enableUrl);
urlRouter.patch("/:id/disable", authenticateUser, disableUrl);
