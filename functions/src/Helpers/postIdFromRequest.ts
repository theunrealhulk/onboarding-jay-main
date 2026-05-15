import type { Request } from "express";

function pickQuery(raw: unknown): string | undefined {
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  if (Array.isArray(raw)) {
    for (const x of raw) {
      if (typeof x === "string" && x.trim().length > 0) {
        return x.trim();
      }
    }
  }
  return undefined;
}

function postIdFromUrlStrings(...urls: Array<string | undefined>): string | undefined {
  for (const full of urls) {
    if (!full || typeof full !== "string") {
      continue;
    }
    const qIndex = full.indexOf("?");
    if (qIndex === -1) {
      continue;
    }
    const params = new URLSearchParams(full.slice(qIndex + 1));
    const id = params.get("postId") ?? params.get("id");
    if (id && id.trim().length > 0) {
      return id.trim();
    }
  }
  return undefined;
}

export function postIdFromRequest(req: Request): string | undefined {
  const fromQuery = pickQuery(req.query.postId) ?? pickQuery(req.query.id);
  if (fromQuery) {
    return fromQuery;
  }

  const ex = req as Request & { originalUrl?: string };
  const fromUrl = postIdFromUrlStrings(ex.originalUrl, req.url);
  if (fromUrl) {
    return fromUrl;
  }

  if (
    (req.method === "POST" || req.method === "PUT" || req.method === "DELETE" || req.method === "PATCH") &&
    req.body &&
    typeof req.body === "object"
  ) {
    const b = req.body as { postId?: unknown };
    if (typeof b.postId === "string" && b.postId.trim().length > 0) {
      return b.postId.trim();
    }
  }

  return undefined;
}
