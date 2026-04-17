import { Link, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import { formatPrice } from "../utils/price.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function CheckoutSuccessPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const location = useLocation();
  const order = location.state?.order;
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";

  if (!order?.id) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="min-h-dvh min-w-0 bg-slate-100">
      <SiteHeader />
      <main className="mx-auto min-w-0 w-full max-w-lg px-4 py-16 text-center sm:px-5">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl" aria-hidden>
            ✓
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">{t("checkout.successTitle")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("checkout.successBody")}</p>
          <dl className="mt-8 space-y-2 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t("checkout.orderNumber")}</dt>
              <dd className="font-mono font-semibold text-slate-900">{order.order_number}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">{t("checkout.grandTotal")}</dt>
              <dd className="font-semibold tabular-nums text-slate-900">{formatPrice(order.total, lang)}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/shop"
              className="inline-flex justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-400"
            >
              {t("checkout.continueShopping")}
            </Link>
            {isCustomer ? (
              <Link
                to="/account/orders"
                className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {t("checkout.viewOrders")}
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {t("checkout.createAccount")}
              </Link>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
