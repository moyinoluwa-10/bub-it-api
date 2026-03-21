import QRCode from "qrcode";
import shortid from "shortid";
import validUrl from "valid-url";
import { Types } from "mongoose";
import { Url, IUrlDocument } from "./url.model";
import { BadRequestError, NotFoundError } from "../../errors";
import { env } from "../../config/env";
import { checkPermissions } from "../../utils/checkPermissions";
import { cache } from "../../lib/cache"; // your redis wrapper (or null-safe client)
import {
  CreateUrlInput,
  UpdateUrlStateInput,
  GenerateQrInput,
  GetByIdInput,
  DeleteUrlInput,
  UrlBasic,
} from "./url.dto";

function baseUrlOrThrow(): string {
  const baseUrl = env.REDIRECT_URL;
  if (!baseUrl || !validUrl.isUri(baseUrl)) {
    throw new BadRequestError("Invalid base URL");
  }
  return baseUrl.replace(/\/+$/, ""); // strip trailing slash
}

function validateLongUrlOrThrow(longUrl: string) {
  if (!longUrl || !validUrl.isWebUri(longUrl)) {
    throw new BadRequestError("Invalid long URL");
  }
}

function normalizeCustom(custom?: string): string | undefined {
  if (!custom) return undefined;
  const c = custom.trim();
  if (!c) return undefined;
  // keep it url-safe-ish; adjust rules as you like
  if (!/^[a-zA-Z0-9-_]+$/.test(c)) {
    throw new BadRequestError("Custom alias contains invalid characters");
  }
  return c;
}

function urlDocumentToBasic(url: IUrlDocument): UrlBasic {
  return {
    id: url._id.toString(),
    longUrl: url.longUrl,
    shortUrl: url.shortUrl,
    customUrl: url.customUrl,
    noOfClicks: url.noOfClicks,
    qrcode: url.qrcode,
    active: url.active,
    createdAt: url.createdAt,
    updatedAt: url.updatedAt,
    analytics: url.analytics,
  };
}

export function urlDocumentsToBasic(urls: IUrlDocument[]): UrlBasic[] {
  return urls.map(urlDocumentToBasic);
}

// Cache keys
const CACHE_ALL_URLS = "urls";
const cacheUrlKey = (id: string) => `url:${id}`;
const cacheUserUrlsKey = (userId: string) => `url:user:${userId}`;
const cacheUrlCodeKey = (code: string) => `url:code:${code}`;

async function invalidateCaches(opts: {
  id?: string;
  userId?: string;
  urlCode?: string;
  custom?: string;
}) {
  if (env.NODE_ENV === "test") return;
  const ops: Promise<any>[] = [];
  ops.push(cache.del(CACHE_ALL_URLS));
  if (opts.id) ops.push(cache.del(cacheUrlKey(opts.id)));
  if (opts.userId) ops.push(cache.del(cacheUserUrlsKey(opts.userId)));
  if (opts.urlCode) ops.push(cache.del(cacheUrlCodeKey(opts.urlCode)));
  if (opts.custom) ops.push(cache.del(cacheUrlCodeKey(opts.custom)));
  await Promise.allSettled(ops);
}

export const urlService = {
  async createUrl(
    input: CreateUrlInput,
  ): Promise<{ url: UrlBasic; existing: boolean }> {
    const baseUrl = baseUrlOrThrow();
    validateLongUrlOrThrow(input.longUrl);

    const custom = normalizeCustom(input.custom);
    const userId = input.user?.userId
      ? new Types.ObjectId(input.user.userId)
      : null;

    // If custom is used, ensure uniqueness across all users (or scope to user if you want)
    if (custom) {
      const existingCustom = await Url.findOne({ custom }).lean();
      if (existingCustom)
        throw new BadRequestError("Custom alias already in use");
    }

    // Prevent duplicates per user (anonymous duplicates prevented globally)
    const existing = await Url.findOne({
      longUrl: input.longUrl,
      userId: userId ?? undefined,
    });
    if (existing) return { url: urlDocumentToBasic(existing), existing: true };

    const urlCode = shortid.generate();
    const shortUrl = `${baseUrl}/${urlCode}`;
    const customUrl = custom ? `${baseUrl}/${custom}` : undefined;

    const created = await Url.create({
      urlCode,
      longUrl: input.longUrl,
      shortUrl,
      custom,
      customUrl,
      userId: userId ?? undefined,
      active: true,
    });

    await invalidateCaches({
      userId: input.user?.userId,
      urlCode,
      custom,
    });

    return {
      url: urlDocumentToBasic(created),
      existing: false,
    };
  },

  async generateQrCode(
    input: GenerateQrInput,
  ): Promise<{ url: UrlBasic; qrcode: string }> {
    const url = await Url.findById(input.id);
    if (!url) throw new NotFoundError("ShortURL not found");

    // Owner/admin check
    checkPermissions(input.requestUser, url.userId as Types.ObjectId);

    if (url.qrcode) {
      return {
        url: urlDocumentToBasic(url),
        qrcode: url.qrcode,
      };
    }

    const qrcode = await QRCode.toDataURL(url.longUrl);
    url.qrcode = qrcode;
    await url.save();

    if (env.NODE_ENV !== "test") {
      await cache.setEx(cacheUrlKey(input.id), 3600, JSON.stringify(url));
    }

    await invalidateCaches({
      id: input.id,
      userId: input.requestUser?.userId,
      urlCode: url.urlCode,
      custom: url.custom,
    });

    return {
      url: urlDocumentToBasic(url),
      qrcode,
    };
  },

  async setActiveState(
    input: UpdateUrlStateInput,
  ): Promise<{ active: boolean; url: UrlBasic }> {
    const url = await Url.findById(input.id);
    if (!url) throw new NotFoundError("ShortURL not found");

    checkPermissions(input.requestUser, url.userId as Types.ObjectId);

    url.active = input.active;
    await url.save();

    if (env.NODE_ENV !== "test") {
      await cache.setEx(cacheUrlKey(input.id), 3600, JSON.stringify(url));
    }

    await invalidateCaches({
      id: input.id,
      userId: input.requestUser?.userId,
      urlCode: url.urlCode,
      custom: url.custom,
    });

    return {
      active: input.active,
      url: urlDocumentToBasic(url),
    };
  },

  async getAllUrls(): Promise<{
    urls: UrlBasic[];
    count: number;
    cache: "hit" | "miss";
  }> {
    if (env.NODE_ENV !== "test") {
      const cached = await cache.get(CACHE_ALL_URLS);
      if (cached) {
        const parsed = JSON.parse(cached) as IUrlDocument[];
        return {
          urls: urlDocumentsToBasic(parsed),
          count: parsed.length,
          cache: "hit",
        };
      }
    }

    const urls = await Url.find().sort({ createdAt: -1 }).lean();

    if (env.NODE_ENV !== "test") {
      await cache.setEx(CACHE_ALL_URLS, 3600, JSON.stringify(urls));
    }

    return {
      urls: urlDocumentsToBasic(urls),
      count: urls.length,
      cache: "miss",
    };
  },

  async getById(
    input: GetByIdInput,
  ): Promise<{ url: UrlBasic; cache: "hit" | "miss" }> {
    const { id } = input;

    if (env.NODE_ENV !== "test") {
      const cached = await cache.get(cacheUrlKey(id));
      if (cached) {
        const url = JSON.parse(cached);
        // still enforce permission
        checkPermissions(input.requestUser, url.userId);
        return {
          url: urlDocumentToBasic(url),
          cache: "hit" as const,
        };
      }
    }

    const url = await Url.findById(id);
    if (!url) throw new NotFoundError("ShortURL not found");

    checkPermissions(input.requestUser, url.userId as Types.ObjectId);

    if (env.NODE_ENV !== "test") {
      await cache.setEx(cacheUrlKey(id), 3600, JSON.stringify(url));
    }

    return {
      url: urlDocumentToBasic(url),
      cache: "miss" as const,
    };
  },

  async getUserUrls(
    userId: string,
  ): Promise<{ urls: UrlBasic[]; count: number; cache: "hit" | "miss" }> {
    if (!userId) throw new BadRequestError("UserId is required");

    if (env.NODE_ENV !== "test") {
      const cached = await cache.get(cacheUserUrlsKey(userId));
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          urls: urlDocumentsToBasic(parsed),
          count: parsed.length,
          cache: "hit" as const,
        };
      }
    }

    const urls = await Url.find({ userId }).sort({ createdAt: -1 }).lean();

    if (env.NODE_ENV !== "test") {
      await cache.setEx(cacheUserUrlsKey(userId), 3600, JSON.stringify(urls));
    }

    return {
      urls: urlDocumentsToBasic(urls),
      count: urls.length,
      cache: "miss" as const,
    };
  },

  async deleteUrl(input: DeleteUrlInput): Promise<void> {
    const url = await Url.findById(input.id);
    if (!url) throw new NotFoundError("ShortURL not found");

    checkPermissions(input.requestUser, url.userId as Types.ObjectId);

    await Url.deleteOne({ _id: url._id });

    await invalidateCaches({
      id: input.id,
      userId: input.requestUser?.userId,
      urlCode: url.urlCode,
      custom: url.custom,
    });

    return;
  },
};
