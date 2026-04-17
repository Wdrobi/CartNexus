import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { deliveryZoneDisplayName } from "../../utils/deliveryZoneLabel.js";

/** Approximate anchor points for business zones (not survey boundaries). */
const ZONE_POINTS = {
  inside_dhaka: { lat: 23.8103, lng: 90.4125 },
  dhaka_subcity: { lat: 23.92, lng: 90.38 },
  outside_dhaka: { lat: 23.45, lng: 89.15 },
};

const COLORS = {
  inside_dhaka: "#14b8a6",
  dhaka_subcity: "#2dd4bf",
  outside_dhaka: "#8b5cf6",
};

const EXTRA_COLORS = ["#f59e0b", "#ec4899", "#22c55e", "#6366f1", "#06b6d4", "#a855f7", "#f43f5e"];

/** Stable pseudo-position for dynamic zone keys (not geographic truth). */
function zoneAnchor(zone) {
  if (ZONE_POINTS[zone]) return ZONE_POINTS[zone];
  let h = 2166136261;
  for (let i = 0; i < zone.length; i++) {
    h ^= zone.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u1 = (Math.abs(h) % 10000) / 10000;
  const u2 = (Math.abs(h >>> 8) % 10000) / 10000;
  return { lat: 23.72 + u1 * 0.38, lng: 90.12 + u2 * 0.55 };
}

function zoneStrokeFill(zone, index) {
  const c = COLORS[zone] || EXTRA_COLORS[index % EXTRA_COLORS.length];
  return { color: c, fillColor: c };
}

function FitBounds({ zoneList, zoneMax }) {
  const map = useMap();
  const hasRev = zoneList.some((z) => Number(z.revenue) > 0);
  if (!hasRev || zoneMax <= 0) return null;
  try {
    const pts = zoneList.map((z) => {
      const p = zoneAnchor(z.zone);
      return [p.lat, p.lng];
    });
    if (pts.length === 1) {
      map.setView(pts[0], 9);
    } else if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 9 });
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * OpenStreetMap + zone circles sized by revenue share (illustrative).
 */
export default function ZoneLeafletMap({ zoneList, zoneMax, t, lang, formatPrice }) {
  const center = [23.7, 90.25];
  const zoom = 7;

  return (
    <div className="relative z-0 h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom style={{ minHeight: 260 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds zoneList={zoneList} zoneMax={zoneMax} />
        {zoneList.map((z, index) => {
          const pt = zoneAnchor(z.zone);
          const rev = Number(z.revenue) || 0;
          const ratio = zoneMax > 0 ? rev / zoneMax : 0;
          const radiusPx = Math.max(10, Math.min(48, 12 + ratio * 38));
          const fillOpacity = 0.15 + ratio * 0.55;
          const { color, fillColor } = zoneStrokeFill(z.zone, index);
          const name = deliveryZoneDisplayName(t, z.zone);
          return (
            <CircleMarker
              key={z.zone}
              center={[pt.lat, pt.lng]}
              radius={radiusPx}
              pathOptions={{
                color,
                fillColor,
                fillOpacity,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm text-slate-800">
                  <strong>{name}</strong>
                  <div className="mt-1 text-xs">
                    {lang?.startsWith("bn") ? "রেভিনিউ" : "Revenue"}: {formatPrice(rev, lang)}
                  </div>
                  <div className="text-xs text-slate-600">
                    {z.orders} {t("admin.dashboard.zoneOrders")}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <p className="pointer-events-none absolute bottom-2 left-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] text-slate-400">
        {t("admin.dashboard.mapZoneDisclaimer")}
      </p>
    </div>
  );
}
