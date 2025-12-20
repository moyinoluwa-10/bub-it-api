import { Schema, model, Document, Types } from "mongoose";

export interface ITokenDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  isValid: boolean;
  userAgent: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<ITokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: { type: String, required: true },
    isValid: { type: Boolean, default: true, index: true },
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

export const Token = model<ITokenDocument>("Token", tokenSchema);
