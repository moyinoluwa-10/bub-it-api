import { Router } from "express";
import {
  listUsers,
  getUserById,
  updateUserRole,
  getUserProfile,
} from "./user.controller";
import { authenticateUser, authorizePermissions } from "../../middleware/auth";

export const userRouter = Router();

userRouter.use(authenticateUser);

userRouter.get("/me", getUserProfile);

// All further routes authenticated + admin-only
userRouter.use(authorizePermissions("admin"));

userRouter.get("/", listUsers);

userRouter.get("/:id", getUserById);

userRouter.patch("/:id/role", updateUserRole);
