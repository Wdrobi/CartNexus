import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/apiBase.js";

const StoreSettingsContext = createContext(null);

/** Merge API row with optional `VITE_*` fallbacks when API fails or fields are empty. */
function applyEnvFallbacks(apiSettings) {
  const env = import.meta.env || {};
  const base = apiSettings && typeof apiSettings === "object" ? { ...apiSettings } : {};

  function pick(key, envKey) {
    const a = base[key];
    if (a != null && String(a).trim() !== "") return String(a).trim();
    const e = env[envKey];
    if (e != null && String(e).trim() !== "") return String(e).trim();
    return "";
  }

  return {
    ...base,
    socialFacebookUrl: pick("socialFacebookUrl", "VITE_SOCIAL_FACEBOOK_URL"),
    socialInstagramUrl: pick("socialInstagramUrl", "VITE_SOCIAL_INSTAGRAM_URL"),
    socialYoutubeUrl: pick("socialYoutubeUrl", "VITE_SOCIAL_YOUTUBE_URL"),
    socialOtherUrl: pick("socialOtherUrl", "VITE_SOCIAL_OTHER_URL"),
    messengerUrl: pick("messengerUrl", "VITE_MESSENGER_URL"),
    contactPhone: pick("contactPhone", "VITE_STORE_PHONE"),
    contactEmail: pick("contactEmail", "VITE_STORE_EMAIL"),
  };
}

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => applyEnvFallbacks(null));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await apiFetch("/api/store-settings");
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.settings != null && typeof data.settings === "object") {
        setSettings(applyEnvFallbacks(data.settings));
      } else {
        setSettings(applyEnvFallbacks(null));
      }
    } catch {
      setSettings(applyEnvFallbacks(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading, refresh]);

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }
  return ctx;
}
