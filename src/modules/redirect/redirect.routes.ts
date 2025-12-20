import { Router } from "express";
import { redirectUrl } from "./redirect.controller";

export const redirectRouter = Router();

// Public route: /:urlCode
redirectRouter.get("/:urlCode", redirectUrl);
