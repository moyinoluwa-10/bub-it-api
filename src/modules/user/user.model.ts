import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../../config/env";

export type UserRole = "user" | "admin";

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  // flags
  isActive: boolean;
  isVerified: boolean;
  verified?: Date;
  // verification/reset
  verificationToken?: string | null;
  passwordToken?: string | null;
  passwordTokenExpirationDate?: Date | null;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Account state
    isActive: { type: Boolean, default: true, index: true },

    // Verification
    verificationToken: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verified: { type: Date },

    // Password reset
    passwordToken: { type: String, default: null },
    passwordTokenExpirationDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUserDocument>("User", userSchema);
