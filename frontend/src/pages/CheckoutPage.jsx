import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SafeImage from "../components/SafeImage.jsx";
import { PRODUCT_IMAGE_FALLBACK, PRODUCT_IMAGE_FALLBACK_ALT } from "../utils/productImage.js";
import { productName } from "../utils/productText.js";
import { formatPrice } from "../utils/price.js";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { authFetch } from "../api/authFetch.js";

function translateCheckoutError(t, code) {
  if (!code) return "";
  return t(`auth.errors.${code}`, { defaultValue: String(code) });
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const lang = i18n.language;
  const isCustomer = user?.role === "customer";

  const [deliveryZone, setDeliveryZone] = useState("inside_dhaka");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const deliveryFee = useMemo(() => {
    const map = { inside_dhaka: 60, dhaka_subcity: 100, outside_dhaka: 120 };
    return map[deliveryZone] ?? 60;
  }, [deliveryZone]);

  const grandTotal = subtotal + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (isCustomer && user) {
      setCustomerName((n) => n || user.name?.trim() || "");
      if (user.phone) {
        const d = String(user.phone).replace(/\D/g, "");
        const local = d.startsWith("880") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
        setPhone((p) => p || local.slice(0, 11));
      }
    }
  }, [isCustomer, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!items.length) return;
    const name = customerName.trim();
    const addr = address.trim();
    const phDigits = phone.replace(/\D/g, "");
    if (!name || !addr || !phDigits) {
      setError("missing_shipping");
      return;
    }
    const national = phDigits.startsWith("880") ? phDigits.slice(3) : phDigits.startsWith("0") ? phDigits.slice(1) : phDigits;
    if (national.length < 10 || national.length > 11) {
      setError("invalid_phone");
      return;
    }
    const phoneE164ish = `880${national.replace(/^0/, "")}`;

    setSubmitting(true);
    const body = {
      customer_name: name,
      phone: phoneE164ish,
      delivery_address: addr,
      delivery_zone: deliveryZone,
      payment_method: "cod",
      items: items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        size: i.size,
        variantId: i.variantId,
      })),
    };

    try {
      const r = await authFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "request_failed");
        return;
      }
      clearCart();
      navigate("/checkout/success", {
        replace: true,
        state: { order: data.order },
      });
    } catch {
      setError("network");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100">
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-6xl px-4 py-8 sm:px-5 lg:py-10">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{t("checkout.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("checkout.subtitle")}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-5 lg:items-start">
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6 lg:col-span-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isCustomer && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
                {t("checkout.signedInHint")}
              </div>
            )}
            {!token && (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {t("checkout.guestHint")}{" "}
                <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                  {t("checkout.loginLink")}
                </Link>
              </p>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900">{t("checkout.shippingTitle")}</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("checkout.fullName")} *
                  </label>
                  <input
                    required
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("checkout.phone")} *
                  </label>
                  <div className="mt-1.5 flex rounded-xl border border-slate-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20">
                    <span className="flex shrink-0 items-center border-r border-slate-200 px-3 text-sm text-slate-500">
                      +880
                    </span>
                    <input
                      required
                      className="h-11 min-w-0 flex-1 bg-transparent px-3 text-slate-900 outline-none"
                      placeholder="1XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {t("checkout.address")} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900">{t("checkout.deliveryTitle")}</h2>
              <ul className="mt-4 space-y-3">
                {[
                  { id: "inside_dhaka", days: "1–2" },
                  { id: "dhaka_subcity", days: "2–3" },
                  { id: "outside_dhaka", days: "3–5" },
                ].map((z) => (
                  <li key={z.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
                      <input
                        type="radio"
                        name="zone"
                        className="mt-1 text-brand-600"
                        checked={deliveryZone === z.id}
                        onChange={() => setDeliveryZone(z.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-900">{t(`checkout.zone.${z.id}`)}</span>
                        <span className="mt-0.5 block text-sm text-slate-600">
                          {t("checkout.zoneDays", { days: z.days })} · {formatPrice(
                            { inside_dhaka: 60, dhaka_subcity: 100, outside_dhaka: 120 }[z.id],
                            lang
                          )}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900">{t("checkout.paymentTitle")}</h2>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/50">
                <input type="radio" name="pay" className="mt-1 text-brand-600" defaultChecked readOnly />
                <span>
                  <span className="font-medium text-slate-900">{t("checkout.cod")}</span>
                  <span className="mt-0.5 block text-sm text-slate-600">{t("checkout.codHint")}</span>
                </span>
              </label>
            </div>

            {error && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                {translateCheckoutError(t, error)}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="hidden w-full rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:opacity-60 lg:inline-flex lg:items-center lg:justify-center"
            >
              {submitting ? t("auth.submitting") : t("checkout.placeOrder")}
            </button>
          </motion.form>

          <aside className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900">{t("checkout.summaryTitle")}</h2>
              <ul className="mt-4 max-h-[min(50vh,420px)] space-y-4 overflow-y-auto">
                {items.map((line) => {
                  const name = productName({ name_bn: line.name_bn, name_en: line.name_en }, lang);
                  const lineTotal = Number(line.price) * line.qty;
                  const vLabel = (lang?.startsWith("bn") ? line.variantName_bn : line.variantName_en)?.trim();
                  return (
                    <li key={`${line.productId}-${line.size}-${line.variantId ?? 0}`} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200">
                        <SafeImage
                          src={line.image_url}
                          seed={line.productId}
                          fallback={PRODUCT_IMAGE_FALLBACK}
                          fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{name}</p>
                        {vLabel ? (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {t("cart.variant")}: {vLabel}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-600">
                          ×{line.qty} · {formatPrice(lineTotal, lang)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{t("checkout.productTotal")}</span>
                  <span className="tabular-nums font-medium text-slate-900">{formatPrice(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t("checkout.deliveryFee")}</span>
                  <span className="tabular-nums font-medium text-slate-900">{formatPrice(deliveryFee, lang)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
                  <span>{t("checkout.grandTotal")}</span>
                  <span className="tabular-nums">{formatPrice(grandTotal, lang)}</span>
                </div>
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60 lg:hidden"
              >
                {submitting ? t("auth.submitting") : t("checkout.placeOrder")}
                <span aria-hidden>→</span>
              </button>
              <Link
                to="/cart"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("checkout.backToCart")}
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
