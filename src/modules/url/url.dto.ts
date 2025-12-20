import { Analytics } from "./url.model";

export type CreateUrlInput = {
  longUrl: string;
  custom?: string;
  user?: { userId?: string } | null;
};

export type UpdateUrlStateInput = {
  id: string;
  requestUser: any; // your AuthenticatedRequest["user"]
  active: boolean;
};

export type GenerateQrInput = {
  id: string;
  requestUser: any;
};

export type GetByIdInput = {
  id: string;
  requestUser: any;
};

export type DeleteUrlInput = {
  id: string;
  requestUser: any;
};

export interface UrlBasic {
  id: string;
  longUrl: string;
  shortUrl: string;
  customUrl?: string;
  qrcode?: string;
  noOfClicks: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  analytics: Array<Analytics>;
}
