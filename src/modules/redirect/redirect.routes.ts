import { Router } from "express";
import { redirectUrl } from "./redirect.controller";
import { notFound } from "../../middleware/notFound";

export const redirectRouter = Router();

// Public route: /:urlCode
redirectRouter.get("/:urlCode", redirectUrl);
redirectRouter.use(/.*/, notFound);
