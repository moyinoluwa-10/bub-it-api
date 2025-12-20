import { User } from "./user.model";
import { UserBasic, UpdateUserRoleRequest } from "./user.dto";
import { NotFoundError } from "../../errors";

export const userService = {
  async listUsers(): Promise<UserBasic[]> {
    const users = await User.find().sort({ createdAt: -1 });

    return users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      isVerified: u.isVerified,
    }));
  },

  async getUserById(id: string): Promise<UserBasic> {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User not found");

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
  },

  async updateUserRole(
    id: string,
    role: UpdateUserRoleRequest["role"]
  ): Promise<UserBasic> {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User not found");

    user.role = role;
    await user.save();

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
  },

  async getUserProfile(userId: string) {
    const user = await User.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    return {
      user: userData,
    };
  },
};
