import type { AdditionalReferencePhoto } from "@/lib/types";

/** Younger + current (required) + optional extras. */
export const MAX_REFERENCE_PHOTOS_TOTAL = 5;

export const MAX_ADDITIONAL_REFERENCE_PHOTOS = MAX_REFERENCE_PHOTOS_TOTAL - 2;

export function parseAdditionalReferencePhotos(raw: unknown): AdditionalReferencePhoto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const out: AdditionalReferencePhoto[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const rec = entry as { path?: unknown; age?: unknown };
    const path = typeof rec.path === "string" ? rec.path.trim() : "";
    const age = typeof rec.age === "string" ? rec.age.trim() : "";
    if (path && age) {
      out.push({ path, age });
    }
  }

  return out;
}

export function normalizeAdditionalReferencePhotosInput(
  raw: unknown,
): AdditionalReferencePhoto[] {
  return parseAdditionalReferencePhotos(raw).slice(0, MAX_ADDITIONAL_REFERENCE_PHOTOS);
}

/** `form_data.asset_paths` is stored as string paths; narrow from JsonRecord unions. */
export function parseAssetPathStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((entry): entry is string => typeof entry === "string");
}
