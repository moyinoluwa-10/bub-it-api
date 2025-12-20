import { Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AuthenticatedRequest } from "../../middleware/auth";
import { UpdateUserRoleRequest } from "./user.dto";
import { StatusCodes } from "http-status-codes";

export const listUsers = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const users = await userService.listUsers();
    sendResponse(res, StatusCodes.OK, {
      success: true,
      data: { users },
    });
  }
);

export const getUserById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      data: { user },
    });
  }
);

export const updateUserRole = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body as UpdateUserRoleRequest;

    const user = await userService.updateUserRole(id, role);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "User role updated",
      data: { user },
    });
  }
);

export const getUserProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const data = await userService.getUserProfile(userId);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      data,
    });
  }
);
