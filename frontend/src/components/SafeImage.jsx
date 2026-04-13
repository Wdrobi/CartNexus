import { useEffect, useMemo, useState } from "react";
import {
  LOCAL_PLACEHOLDER_PRODUCT,
  PRODUCT_IMAGE_FALLBACK,
  PRODUCT_IMAGE_FALLBACK_ALT,
  PRODUCT_IMAGE_FALLBACK_3,
  normalizeImageUrl,
  picsumSeedUrl,
} from "../utils/productImage.js";

/** Inline SVG — last resort. */
const SVG_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect fill="#f1f5f9" width="800" height="800"/><text x="400" y="400" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="22">CartNexus</text></svg>`,
  );

/**
 * Tries: primary src → (optional picsum by seed) → fallbacks → same-origin SVG → data URI.
 * Do not set referrerPolicy=no-referrer on remote images (some CDNs return 403).
 */
export default function SafeImage({
  src,
  seed,
  fallback = PRODUCT_IMAGE_FALLBACK,
  fallbackAlt = PRODUCT_IMAGE_FALLBACK_ALT,
  className,
  alt = "",
  ...rest
}) {
  const chain = useMemo(() => {
    const primary = normalizeImageUrl(typeof src === "string" ? src : "");
    const picsum = normalizeImageUrl(picsumSeedUrl(seed) || "");
    const fb = normalizeImageUrl(fallback) || PRODUCT_IMAGE_FALLBACK;
    const fb2 = normalizeImageUrl(fallbackAlt) || PRODUCT_IMAGE_FALLBACK_ALT;
    const fb3 = normalizeImageUrl(PRODUCT_IMAGE_FALLBACK_3);
    const local = LOCAL_PLACEHOLDER_PRODUCT;
    const seen = new Set();
    const out = [];
    for (const u of [primary, picsum, fb, fb2, fb3, local, SVG_PLACEHOLDER]) {
      if (u && !seen.has(u)) {
        seen.add(u);
        out.push(u);
      }
    }
    return out.length ? out : [SVG_PLACEHOLDER];
  }, [src, seed, fallback, fallbackAlt]);

  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [src]);

  const current = chain[Math.min(i, chain.length - 1)];

  const { referrerPolicy: _drop, ...imgRest } = rest;

  return (
    <img
      {...imgRest}
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        setI((prev) => (prev + 1 < chain.length ? prev + 1 : prev));
      }}
    />
  );
}
