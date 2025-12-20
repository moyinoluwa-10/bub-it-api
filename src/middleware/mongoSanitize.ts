import type { Request, Response, NextFunction } from "express";

function stripMongoOperators(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) stripMongoOperators(item);
    return;
  }

  const o = obj as Record<string, unknown>;

  for (const key of Object.keys(o)) {
    const value = o[key];

    // Disallow keys that start with $ or include .
    if (key.startsWith("$") || key.includes(".")) {
      delete o[key];
      continue;
    }

    stripMongoOperators(value);
  }
}

export function mongoSanitize(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // body + params are normal mutable objects
  stripMongoOperators(req.body);
  stripMongoOperators(req.params);

  // req.query might be getter-only in your stack → don’t assign to it
  // but the underlying object values are often mutable; try safely
  try {
    stripMongoOperators(req.query as any);
  } catch {
    // If query is truly immutable in this runtime, we just skip it.
    // Alternatively: copy sanitized query into req.locals if you need.
  }

  next();
}
