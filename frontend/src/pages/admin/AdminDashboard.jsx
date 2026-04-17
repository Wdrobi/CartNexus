import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { authFetch } from "../../api/authFetch.js";
import { getAdminDashboardWsUrl } from "../../api/wsUrl.js";
import { formatPrice } from "../../utils/price.js";
import { AUTH_TOKEN_KEY } from "../../auth/storage.js";
import AdminDashboardView from "./AdminDashboardView.jsx";

const POLL_MS = 45_000;

function localYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultRevenueRangeLocal() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: localYMD(start), to: localYMD(now) };
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const defRange = defaultRevenueRangeLocal();
  const [revenueFrom, setRevenueFrom] = useState(defRange.from);
  const [revenueTo, setRevenueTo] = useState(defRange.to);
  const [revenueFromDraft, setRevenueFromDraft] = useState(defRange.from);
  const [revenueToDraft, setRevenueToDraft] = useState(defRange.to);
  const [salesRange, setSalesRange] = useState("7d");
  const [chartRefreshing, setChartRefreshing] = useState(false);
  const [doneTasks, setDoneTasks] = useState(() => new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const dataRef = useRef(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const tc = data?.taskCompletions;
    if (!tc || typeof tc !== "object") return;
    setDoneTasks(() => {
      const s = new Set();
      Object.entries(tc).forEach(([k, v]) => {
        if (v) s.add(k);
      });
      return s;
    });
  }, [data]);

  const toggleTask = useCallback(async (id) => {
    let nextDone = false;
    setDoneTasks((prev) => {
      nextDone = !prev.has(id);
      const n = new Set(prev);
      if (nextDone) n.add(id);
      else n.delete(id);
      return n;
    });
    try {
      const r = await authFetch("/api/admin/dashboard/tasks", {
        method: "PATCH",
        body: JSON.stringify({ taskKey: id, done: nextDone }),
      });
      if (!r.ok) throw new Error(String(r.status));
    } catch {
      setDoneTasks((prev) => {
        const n = new Set(prev);
        if (nextDone) n.delete(id);
        else n.add(id);
        return n;
      });
    }
  }, []);

  const applyRevenueRange = useCallback(() => {
    setRevenueFrom(revenueFromDraft);
    setRevenueTo(revenueToDraft);
  }, [revenueFromDraft, revenueToDraft]);

  const presetRevenueThisMonth = useCallback(() => {
    const r = defaultRevenueRangeLocal();
    setRevenueFromDraft(r.from);
    setRevenueToDraft(r.to);
    setRevenueFrom(r.from);
    setRevenueTo(r.to);
  }, []);

  const presetRevenueLastDays = useCallback((days) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    const f = localYMD(start);
    const t = localYMD(end);
    setRevenueFromDraft(f);
    setRevenueToDraft(t);
    setRevenueFrom(f);
    setRevenueTo(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hadData = dataRef.current != null;
    if (hadData) setChartRefreshing(true);

    const q = new URLSearchParams();
    q.set("revenueFrom", revenueFrom);
    q.set("revenueTo", revenueTo);
    q.set("salesRange", salesRange);

    authFetch(`/api/admin/dashboard?${q.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
          if (typeof d.revenueRangeFrom === "string" && d.revenueRangeFrom) {
            setRevenueFrom(d.revenueRangeFrom);
            setRevenueFromDraft(d.revenueRangeFrom);
          }
          if (typeof d.revenueRangeTo === "string" && d.revenueRangeTo) {
            setRevenueTo(d.revenueRangeTo);
            setRevenueToDraft(d.revenueRangeTo);
          }
          if (typeof d.salesRangeApplied === "string") {
            setSalesRange(d.salesRangeApplied);
          }
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setChartRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revenueFrom, revenueTo, salesRange, refreshTick]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setRefreshTick((x) => x + 1);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [autoRefresh]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return undefined;
    let ws;
    try {
      ws = new WebSocket(getAdminDashboardWsUrl(token));
    } catch {
      return undefined;
    }
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d.type === "dashboard_refresh") {
          setRefreshTick((x) => x + 1);
        }
      } catch {
        /* ignore */
      }
    };
    return () => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const cat = data?.catalog;
  const rev = data?.revenue;
  const ord = data?.orders;
  const dailySales = data?.dailySales ?? data?.salesLast7Days ?? [];
  const revenueByDay = data?.revenueByDay || [];
  const topProducts = data?.topProducts || [];
  const catRev = data?.categoryRevenue || [];
  const recent = data?.recentOrders || [];
  const stockOut = data?.stockOut || [];
  const lowStock = data?.lowStock || [];
  const vOut = data?.variantStockOut || [];
  const vLow = data?.variantLowStock || [];

  const formatDay = (iso) => {
    try {
      const d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return iso;
    }
  };

  const formatDayShort = (iso) => {
    try {
      const d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString(lang?.startsWith("bn") ? "bn-BD" : "en-BD", { day: "numeric", month: "short" });
    } catch {
      return String(iso).slice(5);
    }
  };

  return (
    <div className="mx-auto min-w-0 max-w-[1680px]">
      {!data && !error && <p className="text-slate-500">{t("shop.loading")}</p>}

      {data && (
        <AdminDashboardView
          t={t}
          lang={lang}
          data={data}
          error={error}
          chartRefreshing={chartRefreshing}
          revenueFromDraft={revenueFromDraft}
          setRevenueFromDraft={setRevenueFromDraft}
          revenueToDraft={revenueToDraft}
          setRevenueToDraft={setRevenueToDraft}
          applyRevenueRange={applyRevenueRange}
          presetRevenueThisMonth={presetRevenueThisMonth}
          presetRevenueLastDays={presetRevenueLastDays}
          salesRange={salesRange}
          setSalesRange={setSalesRange}
          formatDay={formatDay}
          formatDayShort={formatDayShort}
          formatPrice={formatPrice}
          dailySales={dailySales}
          revenueByDay={revenueByDay}
          rev={rev}
          ord={ord}
          cat={cat}
          topProducts={topProducts}
          catRev={catRev}
          recent={recent}
          stockOut={stockOut}
          lowStock={lowStock}
          vOut={vOut}
          vLow={vLow}
          doneTasks={doneTasks}
          toggleTask={toggleTask}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          wsConnected={wsConnected}
        />
      )}

      {!data && error && (
        <p className="text-amber-200">
          {t("admin.statsError")} <code>{error}</code>
        </p>
      )}
    </div>
  );
}
