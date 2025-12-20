import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { urlService } from "./url.service";
import { AuthenticatedRequest } from "../../middleware/auth";
import { sendResponse } from "../../utils/sendResponse";

export const createUrl = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { longUrl, custom } = req.body ?? {};
    console.log("body", req.body);

    const result = await urlService.createUrl({
      longUrl,
      custom,
      user: req.user ? { userId: req.user.userId } : null,
    });

    sendResponse(res, result.existing ? StatusCodes.OK : StatusCodes.CREATED, {
      success: true,
      message: result.existing
        ? "ShortURL already created"
        : "ShortURL created successfully",
      data: { url: result.url },
    });
  }
);

export const generateQrcode = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await urlService.generateQrCode({
      id,
      requestUser: req.user,
    });

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "Qrcode already generated",
      data: { qrcode: result.qrcode, url: result.url },
    });
  }
);

export const enableUrl = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await urlService.setActiveState({
      id,
      requestUser: req.user,
      active: true,
    });

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "ShortURL enabled successfully",
      data: { url: result.url },
    });
  }
);

export const disableUrl = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await urlService.setActiveState({
      id,
      requestUser: req.user,
      active: false,
    });

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "ShortURL disabled successfully",
      data: { url: result.url },
    });
  }
);

export const getAllUrls = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const result = await urlService.getAllUrls();

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "All ShortURLs fetched successfully",
      data: { urls: result.urls, count: result.count },
    });
  }
);

export const getAUrl = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await urlService.getById({
      id,
      requestUser: req.user,
    });

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "ShortURL fetched successfully",
      data: { url: result.url },
    });
  }
);

export const getUserUrls = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const result = await urlService.getUserUrls(userId as string);

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "User ShortURLs fetched successfully",
      data: { urls: result.urls, count: result.count },
    });
  }
);

export const deleteUrl = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const result = await urlService.deleteUrl({
      id,
      requestUser: req.user,
    });

    sendResponse(res, StatusCodes.OK, {
      success: true,
      message: "ShortURL deleted successfully",
    });
  }
);
