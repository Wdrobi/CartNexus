import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cartnexus_cart_v2";

/** @typedef {{ productId: number; slug: string; name_bn: string; name_en: string; image_url: string | null; price: number; qty: number; size: string; variantId: number | null; variantName_bn: string; variantName_en: string }} CartLine */

function lineKey(productId, size, variantId) {
  const v = variantId != null && variantId !== "" ? String(variantId) : "0";
  return `${productId}::${size}::${v}`;
}

function normalizeLine(raw) {
  if (!raw || typeof raw !== "object") return null;
  const productId = Number(raw.productId);
  if (!Number.isFinite(productId)) return null;
  return {
    productId,
    slug: String(raw.slug || ""),
    name_bn: String(raw.name_bn || ""),
    name_en: String(raw.name_en || ""),
    image_url: raw.image_url != null ? String(raw.image_url) : null,
    price: Number(raw.price),
    qty: Math.max(1, Math.floor(Number(raw.qty) || 1)),
    size: String(raw.size || "ONE"),
    variantId: raw.variantId != null && raw.variantId !== "" ? Number(raw.variantId) : null,
    variantName_bn: String(raw.variantName_bn || raw.variantNameBn || ""),
    variantName_en: String(raw.variantName_en || raw.variantNameEn || ""),
  };
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("cartnexus_cart_v1");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) {
          return parsed.map((x) =>
            normalizeLine({
              ...x,
              variantId: x.variantId ?? null,
              variantName_bn: x.variantName_bn ?? "",
              variantName_en: x.variantName_en ?? "",
            }),
          ).filter(Boolean);
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLine).filter(Boolean);
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items]);

  const totalQty = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + Number(i.price) * i.qty, 0), [items]);

  /** @param {Omit<CartLine, 'qty'> & { qty?: number }} line */
  const addItem = useCallback((line) => {
    const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
    const size = String(line.size || "ONE").trim() || "ONE";
    const variantId = line.variantId != null && line.variantId !== "" ? Number(line.variantId) : null;
    const key = lineKey(line.productId, size, variantId);
    const nextLine = {
      productId: line.productId,
      slug: line.slug,
      name_bn: line.name_bn,
      name_en: line.name_en,
      image_url: line.image_url,
      price: Number(line.price),
      qty,
      size,
      variantId: Number.isFinite(variantId) ? variantId : null,
      variantName_bn: String(line.variantName_bn || ""),
      variantName_en: String(line.variantName_en || ""),
    };
    setItems((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => lineKey(x.productId, x.size, x.variantId) === key);
      if (idx >= 0) {
        copy[idx] = { ...copy[idx], qty: Math.min(999, copy[idx].qty + qty) };
        return copy;
      }
      copy.push(nextLine);
      return copy;
    });
  }, []);

  const setLineQty = useCallback((productId, size, variantId, qty) => {
    const q = Math.max(0, Math.min(999, Math.floor(Number(qty) || 0)));
    const key = lineKey(productId, size, variantId);
    setItems((prev) => {
      if (q === 0) return prev.filter((x) => lineKey(x.productId, x.size, x.variantId) !== key);
      return prev.map((x) => (lineKey(x.productId, x.size, x.variantId) === key ? { ...x, qty: q } : x));
    });
  }, []);

  const removeLine = useCallback((productId, size, variantId) => {
    const key = lineKey(productId, size, variantId);
    setItems((prev) => prev.filter((x) => lineKey(x.productId, x.size, x.variantId) !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      totalQty,
      subtotal,
      addItem,
      setLineQty,
      removeLine,
      clearCart,
    }),
    [items, totalQty, subtotal, addItem, setLineQty, removeLine, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
