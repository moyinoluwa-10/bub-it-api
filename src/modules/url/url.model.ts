import { Schema, model, Document, Types } from "mongoose";

export type Analytics = {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  acceptLanguage: String;
  city?: string;
  region?: string;
  country?: string;
};

export interface IUrl {
  urlCode: string;
  longUrl: string;
  qrcode?: string;
  shortUrl: string;
  custom?: string;
  customUrl?: string;
  noOfClicks: number;
  userId?: Types.ObjectId;
  active: boolean;
  analytics: Array<Analytics>;
}

export interface IUrlDocument extends IUrl, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const urlSchema = new Schema<IUrlDocument>(
  {
    urlCode: {
      type: String,
      required: true,
    },
    longUrl: {
      type: String,
      required: true,
    },
    qrcode: String,
    shortUrl: {
      type: String,
      required: true,
    },
    custom: String,
    customUrl: String,
    noOfClicks: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
    analytics: {
      type: [
        {
          timestamp: Date,
          ipAddress: String,
          userAgent: String,
          referrer: String,
          acceptLanguage: String,
          city: String,
          region: String,
          country: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Url = model<IUrlDocument>("Url", urlSchema);
