"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Menu } from "./types";

const STORAGE_KEY = "cafe-cart-v1";
const GROUP_KEY = "cafe-group-code";

type CartContextValue = {
  items: CartItem[];
  groupCode: string | null;
  setGroupCode: (code: string | null) => void;
  add: (menu: Menu, qty?: number) => void;
  setQty: (menuId: string, quantity: number) => void;
  remove: (menuId: string) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function loadGroup(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GROUP_KEY);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [groupCode, setGroupCodeState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setGroupCodeState(loadGroup());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!ready) return;
    if (groupCode) localStorage.setItem(GROUP_KEY, groupCode);
    else localStorage.removeItem(GROUP_KEY);
  }, [groupCode, ready]);

  const setGroupCode = useCallback((code: string | null) => {
    setGroupCodeState(code ? code.toUpperCase() : null);
  }, []);

  const add = useCallback((menu: Menu, qty = 1) => {
    if (!menu.is_available) return;
    setItems((prev) => {
      const found = prev.find((i) => i.menuId === menu.id);
      if (found) {
        return prev.map((i) =>
          i.menuId === menu.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [
        ...prev,
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: qty,
          imageUrl: menu.image_url,
        },
      ];
    });
  }, []);

  const setQty = useCallback((menuId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.menuId !== menuId);
      return prev.map((i) => (i.menuId === menuId ? { ...i, quantity } : i));
    });
  }, []);

  const remove = useCallback((menuId: string) => {
    setItems((prev) => prev.filter((i) => i.menuId !== menuId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const totalCount = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      items,
      groupCode,
      setGroupCode,
      add,
      setQty,
      remove,
      clear,
      totalCount,
      totalPrice,
    };
  }, [items, groupCode, setGroupCode, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatPrice(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
