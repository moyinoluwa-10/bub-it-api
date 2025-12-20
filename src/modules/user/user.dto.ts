import { UserRole } from "./user.model";

export interface UserBasic {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
