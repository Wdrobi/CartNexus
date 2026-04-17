import { useId } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SalesTrendChart,
  CategoryRevenueChart,
  OrderStatusDonutChart,
  RevenueByDayBarChart,
} from "../../components/admin/AdminDashboardCharts.jsx";
import ZoneLeafletMap from "../../components/admin/ZoneLeafletMap.jsx";
import { deliveryZoneDisplayName } from "../../utils/deliveryZoneLabel.js";

function MiniSparkline({ values, className = "" }) {
  const gid = useId().replace(/:/g, "");
  const nums = (values || []).map((v) => Number(v) || 0);
  if (nums.length < 2) return <div className={`h-9 w-[120px] ${className}`} aria-hidden />;
  const max = Math.max(1, ...nums);
  const w = 120;
  const h = 36;
  const step = w / (nums.length - 1);
  const pts = nums
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className={`h-9 w-[120px] shrink-0 ${className}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={`url(#${gid})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function GlassCard({ children, className = "", glow = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 ${
        glow ? "ring-1 ring-brand-500/20" : ""
      } ${className}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export default function AdminDashboardView({
  t,
  lang,
  data,
  error,
  chartRefreshing,
  revenueFromDraft,
  setRevenueFromDraft,
  revenueToDraft,
  setRevenueToDraft,
  applyRevenueRange,
  presetRevenueThisMonth,
  presetRevenueLastDays,
  salesRange,
  setSalesRange,
  formatDay,
  formatDayShort,
  formatPrice,
  dailySales,
  revenueByDay,
  rev,
  ord,
  cat,
  topProducts,
  catRev,
  recent,
  stockOut,
  lowStock,
  vOut,
  vLow,
  doneTasks,
  toggleTask,
  autoRefresh,
  setAutoRefresh,
  wsConnected,
}) {
  const sparkTotals = dailySales.map((d) => d.total);
  const zoneList = (data?.salesByZone || []).map((z) => ({
    zone: String(z.zone),
    revenue: Number(z.revenue) || 0,
    orders: Number(z.order_count) || 0,
  }));
  const zoneMax = zoneList.length ? Math.max(1, ...zoneList.map((z) => z.revenue)) : 1;
  const ret = data?.retention90d || { buyers: 0, repeatBuyers: 0, repeatRate: 0 };
  const forecast = data?.forecast;
  const activity = data?.activityFeed || [];
  const tasks = data?.suggestedTasks || [];

  const salesRangeTabs = [
    { id: "7d", label: t("admin.dashboard.salesRange7d") },
    { id: "30d", label: t("admin.dashboard.salesRange30d") },
    { id: "90d", label: t("admin.dashboard.salesRange90d") },
  ];

  return (
    <div className="relative min-w-0">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-ink-950" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20,184,166,0.22), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.12), transparent), radial-gradient(ellipse 50% 30% at 0% 100%, rgba(45,212,191,0.08), transparent)",
        }}
      />

      <header className="relative mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200/90">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              {t("admin.dashboard.liveOps")}
            </div>
            {wsConnected && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/95">
                <span className="relative flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                {t("admin.dashboard.wsLive")}
              </div>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("admin.dashboard.heroTitle")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{t("admin.dashboard.heroSubtitle")}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500/40"
            />
            <span className="text-xs font-medium text-slate-300">{t("admin.dashboard.autoRefresh")}</span>
          </label>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-1 backdrop-blur-md">
            <p className="px-2 pb-1 pt-1 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {t("admin.dashboard.salesTrendRange")}
            </p>
            <div className="flex rounded-xl bg-white/[0.04] p-0.5">
              {salesRangeTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  disabled={chartRefreshing || !data?.ordersAvailable}
                  onClick={() => setSalesRange(tab.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-40 ${
                    salesRange === tab.id ? "bg-brand-600 text-white shadow-lg shadow-brand-900/40" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {error && (
        <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {t("admin.statsError")} <code className="text-amber-50">{error}</code>
        </p>
      )}

      {!data.ordersAvailable && (
        <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{t("admin.dashboard.ordersMissing")}</p>
      )}

      {/* KPI hero */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          {
            label: t("admin.dashboard.kpiTotalSales"),
            value: formatPrice(rev?.total ?? 0, lang),
            sub: t("admin.dashboard.kpiTotalSalesSub"),
          },
          {
            label: t("admin.dashboard.kpiTotalOrders"),
            value: String(ord?.total ?? 0),
            sub: t("admin.dashboard.kpiTotalOrdersSub"),
          },
          {
            label: t("admin.dashboard.kpiPendingOrders"),
            value: String(ord?.pending ?? 0),
            sub: t("admin.dashboard.kpiPendingOrdersSub"),
            accent: true,
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, type: "spring", stiffness: 120 }}
          >
            <GlassCard glow={k.accent} className="h-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k.label}</p>
                  <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{k.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{k.sub}</p>
                </div>
                <MiniSparkline values={sparkTotals} className="opacity-80" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Bento: charts */}
      <div className={`mb-6 grid gap-4 ${data.ordersAvailable ? "lg:grid-cols-12" : ""}`}>
        <GlassCard className={data.ordersAvailable ? "lg:col-span-8" : ""}>
          <div className="mb-4 flex flex-col gap-2 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.chartSales7")}</h2>
              <p className="text-xs text-slate-500">{t("admin.dashboard.chartSales7Hint")}</p>
            </div>
            {chartRefreshing && <span className="text-xs text-brand-300/80">{t("admin.dashboard.chartRefreshing")}</span>}
          </div>
          <div className={chartRefreshing ? "pointer-events-none opacity-50" : ""}>
            {dailySales.length ? (
              <SalesTrendChart data={dailySales} formatDay={formatDay} formatPrice={formatPrice} lang={lang} />
            ) : (
              <p className="py-16 text-center text-sm text-slate-500">{t("admin.dashboard.noSalesData")}</p>
            )}
          </div>
        </GlassCard>

        {data.ordersAvailable && (
          <GlassCard className="lg:col-span-4">
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.chartOrderMix")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.chartOrderMixHint")}</p>
            <div className="mt-2">
              <OrderStatusDonutChart t={t} orders={ord} emptyLabel={t("admin.dashboard.noOrderMix")} />
            </div>
          </GlassCard>
        )}
      </div>

      {/* Daily revenue (custom date range) */}
      {data.ordersAvailable && (
        <GlassCard className="mb-6">
          <div className="flex flex-col gap-4 border-b border-white/5 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.revenueDailyChart")}</h2>
              <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.revenueDailyChartHint")}</p>
            </div>
            <div className="flex w-full max-w-xl flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={chartRefreshing}
                  onClick={presetRevenueThisMonth}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {t("admin.dashboard.revenuePresetThisMonth")}
                </button>
                <button
                  type="button"
                  disabled={chartRefreshing}
                  onClick={() => presetRevenueLastDays(7)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {t("admin.dashboard.revenuePresetLast7d")}
                </button>
                <button
                  type="button"
                  disabled={chartRefreshing}
                  onClick={() => presetRevenueLastDays(30)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {t("admin.dashboard.revenuePresetLast30d")}
                </button>
              </div>
              <div className="flex flex-wrap items-end justify-end gap-2 sm:items-center">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500">{t("admin.dashboard.revenueDateFrom")}</span>
                  <input
                    type="date"
                    value={revenueFromDraft}
                    max={revenueToDraft}
                    disabled={chartRefreshing}
                    onChange={(e) => setRevenueFromDraft(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-sm text-white outline-none focus:border-brand-500/50 disabled:opacity-40"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500">{t("admin.dashboard.revenueDateTo")}</span>
                  <input
                    type="date"
                    value={revenueToDraft}
                    min={revenueFromDraft}
                    disabled={chartRefreshing}
                    onChange={(e) => setRevenueToDraft(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-sm text-white outline-none focus:border-brand-500/50 disabled:opacity-40"
                  />
                </label>
                <button
                  type="button"
                  disabled={chartRefreshing}
                  onClick={applyRevenueRange}
                  className="rounded-lg border border-brand-500/40 bg-brand-600/30 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600/45 disabled:opacity-40 sm:mb-0"
                >
                  {t("admin.dashboard.revenueRangeApply")}
                </button>
              </div>
              {chartRefreshing && (
                <span className="text-xs text-brand-300/80 lg:text-right">{t("admin.dashboard.chartRefreshing")}</span>
              )}
            </div>
          </div>
          <div className={`mt-4 ${chartRefreshing ? "pointer-events-none opacity-45" : ""}`}>
            <RevenueByDayBarChart
              data={revenueByDay}
              formatDayAxis={formatDayShort}
              formatDayTooltip={formatDay}
              formatPrice={formatPrice}
              lang={lang}
              emptyLabel={t("admin.dashboard.noRevenueDailyData")}
            />
          </div>
        </GlassCard>
      )}

      <GlassCard className="mb-6">
        <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.chartCategories")}</h2>
        <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.chartCategoriesHint")}</p>
        <div className="mt-4">
          {catRev.length ? (
            <CategoryRevenueChart data={catRev} lang={lang} formatPrice={formatPrice} />
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">{t("admin.dashboard.noCategoryData")}</p>
          )}
        </div>
      </GlassCard>

      {/* Geo-style zones + retention + forecast + tasks + activity */}
      <div className="mb-6 grid gap-4 lg:grid-cols-12">
        <GlassCard className="lg:col-span-5">
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.zoneMapTitle")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.zoneMapHint")}</p>
          {!data.ordersAvailable ? (
            <p className="mt-6 text-sm text-slate-500">{t("admin.dashboard.zoneMapEmpty")}</p>
          ) : (
            <>
              <ZoneLeafletMap zoneList={zoneList} zoneMax={zoneMax} t={t} lang={lang} formatPrice={formatPrice} />
              {zoneList.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">{t("admin.dashboard.zoneMixEmpty")}</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {zoneList.map((z) => (
                    <li key={z.zone}>
                      <div className="mb-1 flex justify-between text-xs text-slate-400">
                        <span>{deliveryZoneDisplayName(t, z.zone)}</span>
                        <span className="tabular-nums text-slate-300">{formatPrice(z.revenue, lang)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-brand-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${(z.revenue / zoneMax) * 100}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {z.orders} {t("admin.dashboard.zoneOrders")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </GlassCard>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.retentionTitle")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.retentionHint")}</p>
            <div className="mt-6 flex items-end gap-4">
              <p className="font-display text-5xl font-bold text-brand-200">{ret.repeatRate}%</p>
              <div className="pb-1 text-xs text-slate-500">
                <p>
                  {ret.repeatBuyers}/{ret.buyers} {t("admin.dashboard.retentionRepeatLabel")}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.forecastTitle")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.forecastHint")}</p>
            {forecast ? (
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.04] px-2 py-3">
                  <p className="text-[10px] uppercase text-slate-500">{t("admin.dashboard.forecastLow")}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">{formatPrice(forecast.estimateLow, lang)}</p>
                </div>
                <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-2 py-3">
                  <p className="text-[10px] uppercase text-brand-200/80">{t("admin.dashboard.forecastMid")}</p>
                  <p className="mt-1 text-sm font-semibold text-brand-100">{formatPrice(forecast.estimateMid, lang)}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] px-2 py-3">
                  <p className="text-[10px] uppercase text-slate-500">{t("admin.dashboard.forecastHigh")}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">{formatPrice(forecast.estimateHigh, lang)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">{t("admin.dashboard.forecastEmpty")}</p>
            )}
          </GlassCard>
        </div>

        <GlassCard className="lg:col-span-3">
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.tasksTitle")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.tasksHint")}</p>
          <ul className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <li className="text-sm text-slate-500">{t("admin.dashboard.tasksEmpty")}</li>
            ) : (
              tasks.map((task) => {
                const tid = String(task.id);
                const done = doneTasks.has(tid);
                return (
                  <li key={tid}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-brand-500/20">
                      <input type="checkbox" checked={done} onChange={() => toggleTask(tid)} className="mt-1 rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500/40" />
                      <span className={`min-w-0 flex-1 text-sm ${done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                        {task.id === "review_pending" && t("admin.dashboard.taskReviewPending", { count: task.count })}
                        {String(task.id).startsWith("restock-") &&
                          t("admin.dashboard.taskRestock", {
                            name: lang?.startsWith("bn") ? task.name_bn : task.name_en,
                          })}
                        {task.id === "review_low_stock" && t("admin.dashboard.taskLowStock", { count: task.count })}
                        {task.id === "fulfillment_queue" && t("admin.dashboard.taskFulfillment", { count: task.count })}
                        {task.id === "welcome_new_customers" && t("admin.dashboard.taskWelcome", { count: task.count })}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <Link to="/admin/orders" className="mt-4 inline-block text-xs font-medium text-brand-400 hover:underline">
            {t("admin.dashboard.viewAllOrders")}
          </Link>
        </GlassCard>
      </div>

      {/* Activity + best sellers */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.activityTitle")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.activityHint")}</p>
          <ul className="mt-4 max-h-[340px] space-y-0 overflow-y-auto border-t border-white/5 pt-3">
            {activity.length === 0 ? (
              <li className="text-sm text-slate-500">{t("admin.dashboard.activityEmpty")}</li>
            ) : (
              activity.map((item, idx) => (
                <li key={`${item.type}-${item.id}`} className="relative flex gap-3 pb-4 pl-1 last:pb-0">
                  {idx < activity.length - 1 && <span className="absolute bottom-0 left-[7px] top-6 w-px bg-white/10" aria-hidden />}
                  <span
                    className={`relative z-[1] mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${
                      item.type === "stock_out" ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]" : "bg-brand-400 shadow-[0_0_10px_rgba(45,212,191,0.45)]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    {item.type === "order" && (
                      <>
                        <p className="text-sm font-medium text-white">
                          {t("admin.dashboard.activityOrder", { number: item.order_number })}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.customer_name} · {formatPrice(item.total, lang)} · {t(`admin.orderStatus.${item.status}`, { defaultValue: item.status })}
                        </p>
                        {item.created_at && (
                          <p className="mt-1 text-[11px] text-slate-600">
                            {new Date(item.created_at).toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                        )}
                      </>
                    )}
                    {item.type === "stock_out" && (
                      <>
                        <p className="text-sm font-medium text-rose-200/90">{t("admin.dashboard.activityStock")}</p>
                        <p className="truncate text-xs text-slate-400">{lang?.startsWith("bn") ? item.name_bn : item.name_en}</p>
                      </>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.topProducts")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.topProductsHint")}</p>
          <ol className="mt-4 space-y-3">
            {topProducts.length ? (
              topProducts.map((p, idx) => (
                <li
                  key={p.product_id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] text-brand-400/90">#{idx + 1}</span>
                    <p className="truncate font-medium text-white">{lang?.startsWith("bn") ? p.name_bn : p.name_en}</p>
                    <p className="text-xs text-slate-500">
                      {t("admin.dashboard.unitsSold")}: {p.units_sold}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-brand-200">{formatPrice(p.revenue, lang)}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500">{t("admin.dashboard.noTopProducts")}</p>
            )}
          </ol>
        </GlassCard>
      </div>

      {/* Catalog strip */}
      <GlassCard className="mb-6">
        <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.sectionCatalog")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: t("admin.stats.categories"), value: cat?.categories ?? 0 },
            { label: t("admin.stats.brands"), value: cat?.brands ?? 0 },
            { label: t("admin.stats.products"), value: cat?.products ?? 0 },
            { label: t("admin.stats.activeProducts"), value: cat?.activeProducts ?? 0 },
            { label: t("admin.stats.users"), value: cat?.users ?? 0 },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-4 text-center">
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-white">{c.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Inventory */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.stockAlerts")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.stockAlertsHint")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-300/90">{t("admin.dashboard.stockOut")}</p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-slate-300">
                {stockOut.length ? (
                  stockOut.map((p) => (
                    <li key={p.id} className="truncate">
                      · {lang?.startsWith("bn") ? p.name_bn : p.name_en} <span className="text-rose-300/80">({p.stock})</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">{t("admin.dashboard.none")}</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">{t("admin.dashboard.lowStock")}</p>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-slate-300">
                {lowStock.length ? (
                  lowStock.map((p) => (
                    <li key={p.id} className="truncate">
                      · {lang?.startsWith("bn") ? p.name_bn : p.name_en} <span className="text-amber-200/80">({p.stock})</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">{t("admin.dashboard.none")}</li>
                )}
              </ul>
            </div>
            {(vOut.length > 0 || vLow.length > 0) && (
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-300/90">{t("admin.dashboard.variantOut")}</p>
                  <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-sm text-slate-300">
                    {vOut.length ? (
                      vOut.map((v) => (
                        <li key={v.id} className="truncate">
                          · {v.product_name_en} — {lang?.startsWith("bn") ? v.name_bn : v.name_en}
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">{t("admin.dashboard.none")}</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">{t("admin.dashboard.variantLow")}</p>
                  <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-sm text-slate-300">
                    {vLow.length ? (
                      vLow.map((v) => (
                        <li key={v.id} className="truncate">
                          · {v.product_name_en} — {lang?.startsWith("bn") ? v.name_bn : v.name_en}{" "}
                          <span className="text-amber-200/80">({v.stock})</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">{t("admin.dashboard.none")}</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.revMonth")}</h2>
          <p className="mt-2 font-display text-4xl font-bold text-white">{formatPrice(rev?.month ?? 0, lang)}</p>
          <p className="mt-2 text-xs text-slate-500">{t("admin.dashboard.revToday")}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-brand-200">{formatPrice(rev?.today ?? 0, lang)}</p>
          <p className="mt-4 text-xs text-slate-500">{t("admin.dashboard.newCustomers7d")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-violet-300">{String(data?.newCustomers7d ?? 0)}</p>
        </GlassCard>
      </div>

      {/* Recent orders */}
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-white">{t("admin.dashboard.recentOrders")}</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-brand-400 hover:underline">
            {t("admin.dashboard.viewAllOrders")}
          </Link>
        </div>
        <p className="mt-1 text-xs text-slate-500">{t("admin.dashboard.recentOrdersHint")}</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("admin.ordersColNumber")}</th>
                <th className="px-4 py-3">{t("admin.ordersColCustomer")}</th>
                <th className="px-4 py-3">{t("admin.ordersColTotal")}</th>
                <th className="px-4 py-3">{t("admin.ordersColStatus")}</th>
                <th className="px-4 py-3">{t("admin.ordersColDate")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-brand-200">{o.order_number}</td>
                    <td className="px-4 py-3 text-white">{o.customer_name}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-200">{formatPrice(o.total, lang)}</td>
                    <td className="px-4 py-3 text-slate-400">{t(`admin.orderStatus.${o.status}`, { defaultValue: o.status })}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    {t("admin.dashboard.noRecentOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
