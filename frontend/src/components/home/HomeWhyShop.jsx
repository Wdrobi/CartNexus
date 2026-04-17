import { useTranslation } from "react-i18next";

function IconTruck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 18V6H1v12h2.5M14 18h5M14 18H8M17 18h2a1 1 0 001-1v-3.18M17 18v-4M17 8h3l3 3v4" />
      <circle cx="6.5" cy="18.5" r="2.5" />
      <circle cx="17.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconHeadset({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 14v-1a8 8 0 0116 0v1M4 14v3a2 2 0 002 2h1M4 14H3v4h2M20 14v3a2 2 0 01-2 2h-1M20 14h1v4h-2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 18v1a3 3 0 003 3h0a3 3 0 003-3v-1" strokeLinecap="round" />
    </svg>
  );
}

function IconShieldCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 21s8-4 8-10V6l-8-3-8 3v5c0 6 8 10 8 10z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconVerified({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" />
      <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CARDS = [
  { Icon: IconTruck, iconWrap: "bg-rose-100 text-rose-600" },
  { Icon: IconHeadset, iconWrap: "bg-teal-100 text-teal-600" },
  { Icon: IconShieldCheck, iconWrap: "bg-orange-100 text-orange-600" },
  { Icon: IconVerified, iconWrap: "bg-fuchsia-100 text-fuchsia-600" },
];

export default function HomeWhyShop() {
  const { t } = useTranslation();
  const keys = [
    { title: "home.dmWhy1Title", body: "home.dmWhy1Body" },
    { title: "home.dmWhy2Title", body: "home.dmWhy2Body" },
    { title: "home.dmWhy3Title", body: "home.dmWhy3Body" },
    { title: "home.dmWhy4Title", body: "home.dmWhy4Body" },
  ];

  return (
    <section className="border-t border-rose-100/70 bg-gradient-to-b from-rose-50/90 via-white to-white py-10 sm:py-12">
      <div className="w-full px-[20px]">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {t("home.dmWhyTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">{t("home.dmWhyLead")}</p>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {CARDS.map(({ Icon, iconWrap }, i) => (
              <li key={keys[i].title}>
                <div className="flex h-full flex-row items-center gap-4 rounded-xl border border-neutral-100/90 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
                    aria-hidden
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-neutral-900 sm:text-lg">{t(keys[i].title)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm">{t(keys[i].body)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
