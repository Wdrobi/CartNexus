import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import SiteHeader from "../SiteHeader.jsx";
import SiteFooter from "../SiteFooter.jsx";
import SafeImage from "../SafeImage.jsx";
import { PRODUCT_IMAGE_FALLBACK_ALT, WIDE_IMAGE_FALLBACK } from "../../utils/productImage.js";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=80";

export default function CustomerAuthLayout({ variant, children }) {
  const { t } = useTranslation();
  const quote =
    variant === "login" ? t("customerAuth.visualQuoteLogin") : t("customerAuth.visualQuoteRegister");

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-slate-100">
      <div className="fixed inset-0 bg-grid-fade opacity-90" aria-hidden />
      <div className="fixed inset-0 bg-hero-mesh opacity-100" aria-hidden />

      <div className="relative flex flex-1 flex-col">
        <SiteHeader />
        <div className="grid flex-1 min-h-0 lg:grid-cols-2">
          <div className="relative order-1 min-h-[200px] lg:order-1 lg:min-h-screen">
            <div className="absolute inset-0 lg:flex lg:items-stretch lg:p-8 xl:p-10">
              <div className="relative flex h-full w-full items-stretch">
                <div className="pointer-events-none absolute -inset-2 hidden rounded-[2rem] bg-gradient-to-br from-brand-500/25 via-transparent to-brand-800/20 blur-2xl lg:block" />
                <div className="relative h-full w-full overflow-hidden border border-white/10 lg:rounded-3xl lg:shadow-2xl">
                  <SafeImage
                    src={HERO_IMAGE}
                    fallback={WIDE_IMAGE_FALLBACK}
                    fallbackAlt={PRODUCT_IMAGE_FALLBACK_ALT}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-brand-950/20" />
                  <p className="absolute bottom-0 left-0 right-0 p-6 font-display text-xl font-bold leading-snug text-white sm:p-8 sm:text-2xl lg:p-10 lg:text-3xl lg:leading-tight">
                    {quote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-2 flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800/90 to-ink-950/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10"
            >
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent opacity-80"
                aria-hidden
              />
              {children}
            </motion.div>
          </div>
        </div>
        <SiteFooter showCta={false} />
      </div>
    </div>
  );
}
