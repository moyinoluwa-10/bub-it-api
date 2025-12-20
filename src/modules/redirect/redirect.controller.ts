import { Request, Response } from "express";
import path from "path";
import { Url } from "../url/url.model";
import { cache } from "../../lib/cache";
import { env } from "../../config/env";

type RedirectParams = { urlCode: string };

// cache keys
const urlCacheKeyByCode = (code: string) => `url:code:${code}`;
const urlCacheKeyById = (id: string) => `url:${id}`;

// Keep analytics bounded
const ANALYTICS_MAX = env.URL_ANALYTICS_MAX;
const URL_CACHE_TTL = env.URL_CACHE_TTL_SECONDS;

function sendPublicHtml(
  res: Response,
  fileName: "disable.html" | "error.html"
) {
  // public is at repo root
  const filePath = path.resolve(process.cwd(), "public", fileName);
  return res.status(200).sendFile(filePath);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || (req.socket as any)?.remoteAddress || "unknown";
}

function getGeoFromHeaders(req: Request) {
  const h = req.headers;

  // Vercel commonly provides these (may be missing depending on request path/CDN)
  const country = h["x-vercel-ip-country"] || h["x-country"] || null;
  const region = h["x-vercel-ip-country-region"] || h["x-region"] || null;
  const city = h["x-vercel-ip-city"] || null;

  return {
    country: country ? String(country) : null,
    region: region ? String(region) : null,
    city: city ? String(city) : null,
  };
}

export const redirectUrl = async (
  req: Request<RedirectParams>,
  res: Response
) => {
  const code = (req.params.urlCode || "").trim();
  if (!code) return sendPublicHtml(res, "error.html");

  // 1) Cache-first: try by code
  const cached = await cache.getJson<any>(urlCacheKeyByCode(code));
  let urlDoc = cached;

  // 2) Fallback to DB
  if (!urlDoc) {
    urlDoc = await Url.findOne({
      $or: [{ urlCode: code }, { custom: code }],
    }).lean();
  }

  // Not found
  if (!urlDoc) return sendPublicHtml(res, "error.html");

  // Disabled
  if (!urlDoc.active) return sendPublicHtml(res, "disable.html");

  // 3) Build analytics (minimal but useful)
  const geo = getGeoFromHeaders(req);
  const analytics = {
    timestamp: new Date(),
    ipAddress: getClientIp(req),
    userAgent: String(req.get("user-agent") || "unknown"),
    referrer: req.get("referer") || undefined,
    acceptLanguage: String(req.get("accept-language") || "unknown"),
    city: geo.city || undefined,
    region: geo.region || undefined,
    country: geo.country || undefined,
  };

  // 4) Atomic update (avoid race + avoid loading full doc)
  // - increment click count
  // - prepend analytics and cap array length
  await Url.updateOne(
    { _id: urlDoc._id },
    {
      $inc: { noOfClicks: 1 },
      $push: {
        analytics: {
          $each: [analytics],
          $position: 0,
          $slice: ANALYTICS_MAX,
        },
      },
    }
  );

  // 5) Refresh cache asynchronously (best-effort)
  //    Keep code->doc and id->doc caches in sync.
  //    Because we used lean, it’s JSON-friendly.
  urlDoc.noOfClicks = (urlDoc.noOfClicks ?? 0) + 1;
  urlDoc.analytics = [analytics, ...(urlDoc.analytics ?? [])].slice(
    0,
    ANALYTICS_MAX
  );

  await Promise.allSettled([
    cache.setJson(urlCacheKeyByCode(code), urlDoc, URL_CACHE_TTL),
    cache.setJson(urlCacheKeyById(String(urlDoc._id)), urlDoc, URL_CACHE_TTL),
  ]);

  // 6) Redirect
  return res.redirect(302, urlDoc.longUrl);
};
