import "express-serve-static-core";
import { TokenUser } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: TokenUser;
  }
}
