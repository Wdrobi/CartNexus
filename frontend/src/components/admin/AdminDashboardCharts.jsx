import { useId, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AXIS = "#64748b";
const GRID = "rgba(148, 163, 184, 0.12)";

function truncateLabel(s, max) {
  if (s == null || s === "") return "";
  const str = String(s);
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1)}…`;
}

function ChartTooltip({ active, payload, label, footer }) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const display = row?.payload?.tooltipValue ?? row?.value;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0c0f14]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label != null && label !== "" && <p className="mb-1 font-medium text-slate-200">{label}</p>}
      <p className="tabular-nums text-brand-200">{display}</p>
      {footer && <p className="mt-1 text-slate-500">{footer}</p>}
    </div>
  );
}

/**
 * @param {{ date: string, total: number }[]} props.data
 * @param {(iso: string) => string} props.formatDay
 * @param {(n: number, lang: string) => string} props.formatPrice
 * @param {string} props.lang
 */
export function SalesTrendChart({ data, formatDay, formatPrice, lang }) {
  const gradId = useId().replace(/:/g, "");
  const chartData = useMemo(
    () =>
      (data || []).map((r) => ({
        date: r.date,
        dayLabel: formatDay(r.date),
        total: Number(r.total) || 0,
        tooltipValue: formatPrice(Number(r.total) || 0, lang),
      })),
    [data, formatDay, formatPrice, lang]
  );

  const n = chartData.length;
  const xInterval = n > 50 ? 9 : n > 35 ? 6 : n > 20 ? 3 : n > 12 ? 2 : n > 8 ? 1 : 0;
  const tilt = n > 16;
  const dotR = n > 40 ? 0 : n > 24 ? 2 : 3;

  return (
    <div className="h-[280px] w-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: tilt ? 8 : 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="dayLabel"
            tick={{ fill: AXIS, fontSize: n > 30 ? 9 : 11 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            interval={xInterval}
            angle={tilt ? -32 : 0}
            textAnchor={tilt ? "end" : "middle"}
            height={tilt ? 52 : 28}
          />
          <YAxis
            tick={{ fill: AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => {
              const n = Number(v);
              if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
              if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
              return String(n);
            }}
          />
          <Tooltip
            cursor={{ stroke: "rgba(20, 184, 166, 0.35)", strokeWidth: 1 }}
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={payload?.[0]?.payload?.dayLabel}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2dd4bf"
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={dotR > 0 ? { r: dotR, fill: "#99f6e0", strokeWidth: 0 } : false}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * @param {{ date: string, total: number }[]} props.data
 * @param {(iso: string) => string} props.formatDayAxis
 * @param {(iso: string) => string} props.formatDayTooltip
 * @param {(n: number, lang: string) => string} props.formatPrice
 * @param {string} props.lang
 * @param {string} props.emptyLabel
 */
export function RevenueByDayBarChart({ data, formatDayAxis, formatDayTooltip, formatPrice, lang, emptyLabel }) {
  const chartData = useMemo(
    () =>
      (data || []).map((r) => ({
        date: r.date,
        axisLabel: formatDayAxis(r.date),
        tooltipLabel: formatDayTooltip(r.date),
        total: Number(r.total) || 0,
        tooltipValue: formatPrice(Number(r.total) || 0, lang),
      })),
    [data, formatDayAxis, formatDayTooltip, formatPrice, lang]
  );

  const hasAny = chartData.some((r) => r.total > 0);
  if (!hasAny) {
    return <p className="py-12 text-center text-sm text-slate-500">{emptyLabel}</p>;
  }

  const n = chartData.length;
  const xInterval = n > 90 ? 11 : n > 60 ? 7 : n > 40 ? 5 : n > 25 ? 3 : n > 14 ? 2 : n > 10 ? 1 : 0;
  const axisHeight = n > 35 ? 72 : n > 20 ? 60 : 52;
  const maxBarSize = n > 90 ? 10 : n > 45 ? 16 : 28;

  return (
    <div className="h-[300px] w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 6, left: -14, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="axisLabel"
            tick={{ fill: AXIS, fontSize: n > 50 ? 9 : 10 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            interval={xInterval}
            angle={-34}
            textAnchor="end"
            height={axisHeight}
          />
          <YAxis
            tick={{ fill: AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => {
              const num = Number(v);
              if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
              return String(num);
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(20, 184, 166, 0.12)" }}
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload} label={payload?.[0]?.payload?.tooltipLabel} />
            )}
          />
          <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={maxBarSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * @param {Array<{ id: number, name_en: string, name_bn: string, revenue: number }>} props.data
 * @param {string} props.lang
 * @param {(n: number, lang: string) => string} props.formatPrice
 */
export function CategoryRevenueChart({ data, lang, formatPrice }) {
  const chartData = useMemo(() => {
    const rows = [...(data || [])].sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0));
    return rows.map((c) => {
      const full = lang?.startsWith("bn") ? c.name_bn : c.name_en;
      return {
        id: c.id,
        nameShort: truncateLabel(full, 20),
        revenue: Number(c.revenue) || 0,
        tooltipValue: formatPrice(Number(c.revenue) || 0, lang),
        tooltipLabel: full,
      };
    });
  }, [data, lang, formatPrice]);

  const h = Math.min(420, Math.max(200, chartData.length * 32 + 80));

  return (
    <div className="w-full" style={{ height: h }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
          <YAxis type="category" dataKey="nameShort" width={108} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(139, 92, 246, 0.08)" }}
            content={({ active, payload }) => (
              <ChartTooltip active={active} payload={payload} label={payload?.[0]?.payload?.tooltipLabel} />
            )}
          />
          <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const ORDER_STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#38bdf8",
  delivered: "#22c55e",
  cancelled: "#f43f5e",
};

/**
 * @param {import("react-i18next").TFunction} props.t
 * @param {{ pending?: number, processing?: number, delivered?: number, cancelled?: number } | null} props.orders
 * @param {string} props.emptyLabel
 */
export function OrderStatusDonutChart({ t, orders, emptyLabel }) {
  const pieData = useMemo(() => {
    if (!orders) return [];
    const rows = [
      { key: "pending", value: Number(orders.pending) || 0, color: ORDER_STATUS_COLORS.pending },
      { key: "processing", value: Number(orders.processing) || 0, color: ORDER_STATUS_COLORS.processing },
      { key: "delivered", value: Number(orders.delivered) || 0, color: ORDER_STATUS_COLORS.delivered },
      { key: "cancelled", value: Number(orders.cancelled) || 0, color: ORDER_STATUS_COLORS.cancelled },
    ];
    return rows
      .filter((r) => r.value > 0)
      .map((r) => ({
        name: t(`admin.orderStatus.${r.key}`, { defaultValue: r.key }),
        value: r.value,
        color: r.color,
        rawKey: r.key,
      }));
  }, [orders, t]);

  if (!pieData.length) {
    return <p className="flex min-h-[220px] items-center justify-center px-2 text-center text-sm text-slate-500">{emptyLabel}</p>;
  }

  const total = pieData.reduce((s, r) => s + r.value, 0);

  return (
    <div className="flex w-full flex-col" style={{ minHeight: 280 }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={2}
            stroke="none"
          >
            {pieData.map((entry) => (
              <Cell key={entry.rawKey} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0];
              const pct = total > 0 ? Math.round((Number(p.value) / total) * 100) : 0;
              return (
                <div className="rounded-lg border border-white/10 bg-[#0c0f14]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
                  <p className="font-medium text-slate-200">{p.name}</p>
                  <p className="tabular-nums text-brand-200">
                    {p.value} <span className="text-slate-500">({pct}%)</span>
                  </p>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
