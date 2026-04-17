import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SafeImage from "../components/SafeImage.jsx";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT } from "../utils/productImage.js";
import { productName } from "../utils/productText.js";
import { formatPrice } from "../utils/price.js";
import { useCart } from "../cart/CartContext.jsx";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { items, subtotal, setLineQty, removeLine } = useCart();
  const lang = i18n.language;

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100">
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-4xl px-4 py-10 sm:px-5 lg:py-12">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{t("cart.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("cart.subtitle")}</p>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
          >
            <p className="text-slate-700">{t("cart.empty")}</p>
            <Link
              to="/shop"
              className="mt-8 inline-flex rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
            >
              {t("nav.continueShopping")}
            </Link>
          </motion.div>
        ) : (
          <div className="mt-8 space-y-6">
            <ul className="space-y-4">
              {items.map((line) => {
                const name = productName({ name_bn: line.name_bn, name_en: line.name_en }, lang);
                const lineTotal = Number(line.price) * line.qty;
                const vLabel = (lang?.startsWith("bn") ? line.variantName_bn : line.variantName_en)?.trim();

                return (
                  <motion.li
                    key={`${line.productId}-${line.size}-${line.variantId ?? 0}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5"
                  >
                    <Link
                      to={`/shop/${line.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 sm:h-28 sm:w-28"
                    >
                      <SafeImage
                        src={line.image_url}
                        seed={line.productId}
                        fallback={PRODUCT_IMAGE_FALLBACK}
                        fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/shop/${line.slug}`}
                        className="font-display text-base font-semibold text-slate-900 transition hover:text-brand-600 sm:text-lg"
                      >
                        {name}
                      </Link>
                      {vLabel ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {t("cart.variant")}: <span className="font-medium text-slate-700">{vLabel}</span>
                        </p>
                      ) : null}
                      {line.size && line.size !== "ONE" ? (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {/^\d+$/.test(line.size) ? t("shop.product.shoeSize") : t("cart.size")}:{" "}
                          <span className="font-medium text-slate-700">{line.size}</span>
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{formatPrice(line.price, lang)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-white disabled:opacity-30"
                            disabled={line.qty <= 1}
                            onClick={() => setLineQty(line.productId, line.size, line.variantId, line.qty - 1)}
                            aria-label={t("shop.product.decreaseQty")}
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums text-slate-900">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-white disabled:opacity-30"
                            disabled={line.qty >= 99}
                            onClick={() => setLineQty(line.productId, line.size, line.variantId, line.qty + 1)}
                            aria-label={t("shop.product.increaseQty")}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(line.productId, line.size, line.variantId)}
                          className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg font-semibold tabular-nums text-slate-900">{formatPrice(lineTotal, lang)}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <span className="text-lg font-semibold text-slate-900">{t("cart.subtotal")}</span>
                <span className="font-display text-2xl font-bold tabular-nums text-slate-900">{formatPrice(subtotal, lang)}</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">{t("cart.checkoutHint")}</p>
              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
              >
                {t("cart.checkout")}
              </Link>
              <Link
                to="/shop"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {t("nav.continueShopping")}
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
