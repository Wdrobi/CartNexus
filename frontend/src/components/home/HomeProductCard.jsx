import ProductCard from "../ProductCard.jsx";

/**
 * Home listings use the same {@link ProductCard} as shop / category pages.
 *
 * @param {{ product: object; showNewBadge?: boolean; variant?: string }} props — `variant` is ignored (kept for API compatibility)
 */
export default function HomeProductCard({ product, showNewBadge, variant: _variant }) {
  const brandHref =
    product.brand_slug && product.category_slug
      ? `/brands/${encodeURIComponent(product.brand_slug)}?category=${encodeURIComponent(product.category_slug)}`
      : product.brand_slug
        ? `/brands/${encodeURIComponent(product.brand_slug)}`
        : null;
  return (
    <div className="h-full min-h-0">
      <ProductCard product={product} brandHref={brandHref} showNewBadge={showNewBadge} />
    </div>
  );
}
