import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProductById as getDemoProductById, getVariant } from "@/lib/services/catalog";
import { getProductById as getFirebaseProductById } from "@/lib/services/firebase/productService";
import type { Product } from "@/lib/types";
import {
  signInCustomer,
  registerCustomer,
  signInWithGoogle,
  signInWithGoogleCredential,
  completeGoogleRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateUserProfile,
} from "@/lib/services/firebase/authService";
import {
  loadGuestCart,
  saveGuestCart,
  loadFirestoreCart,
  saveCartLine,
  removeCartLine as removeFirestoreCartLine,
  clearFirestoreCart,
  mergeGuestCartOnLogin,
} from "@/lib/services/firebase/cartService";
import {
  loadGuestWishlist,
  saveGuestWishlist,
  loadFirestoreWishlist,
  addToFirestoreWishlist,
  removeFromFirestoreWishlist,
  mergeGuestWishlistOnLogin,
} from "@/lib/services/firebase/wishlistService";
import {
  createOrder as createFirestoreOrder,
  getUserOrders,
} from "@/lib/services/firebase/orderService";

import type { Address, CartLine, CartLineView, Order, PaymentMethod, User } from "@/lib/types";

export const SHIPPING_FLAT = 150;
export const FREE_SHIPPING_THRESHOLD = 5000;

interface StoreValue {
  hydrated: boolean;
  // cart
  lines: CartLine[];
  cartLines: CartLineView[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  showLoginPrompt: boolean;
  setShowLoginPrompt: (open: boolean) => void;
  requestLogin: () => void;
  // wishlist
  wishlist: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  // session
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogleCredential: (idToken: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    input: Partial<Pick<User, "name" | "email" | "phone" | "defaultAddress">>,
  ) => Promise<void>;
  // orders
  orders: Order[];
  placeOrder: (
    address: Address,
    paymentMethod: PaymentMethod,
    shippingCost: number,
    couponCode?: string,
  ) => Promise<Order | null>;
  getOrder: (id: string) => Order | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const requestLogin = () => setShowLoginPrompt(true);
  // Product cache: stores products fetched from Firebase keyed by productId
  const [productCache, setProductCache] = useState<Record<string, Product>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Initialize Auth state & Sync Cart/Wishlist/Orders
  useEffect(() => {
    // Complete any pending Google redirect sign-in (mobile fallback flow).
    // Creates the Firestore user doc if new; onAuthStateChanged then fires.
    completeGoogleRedirect().catch(() => {});

    const unsub = onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Authenticated user: load Firestore data & merge local guest data
        const localGuestCart = loadGuestCart();
        const localGuestWishlist = loadGuestWishlist();

        const [userCart, userWishlist, userOrdersList] = await Promise.all([
          mergeGuestCartOnLogin(currentUser.id, localGuestCart),
          mergeGuestWishlistOnLogin(currentUser.id, localGuestWishlist),
          getUserOrders(currentUser.id),
        ]);

        setLines(userCart);
        setWishlist(userWishlist);
        setOrders(userOrdersList);
      } else {
        // Guest user: load local storage
        setLines(loadGuestCart());
        setWishlist(loadGuestWishlist());
        setOrders([]);
      }
      setHydrated(true);
    });

    return () => unsub();
  }, []);

  // Save guest cart / wishlist on change if not logged in
  useEffect(() => {
    if (hydrated && !user) {
      saveGuestCart(lines);
    }
  }, [lines, hydrated, user]);

  useEffect(() => {
    if (hydrated && !user) {
      saveGuestWishlist(wishlist);
    }
  }, [wishlist, hydrated, user]);

  // Fetch any cart products missing from the cache (from Firebase, fallback to demo)
  useEffect(() => {
    const missingIds = lines
      .map((l) => l.productId)
      .filter((id) => !productCache[id] && !fetchingRef.current.has(id));
    if (missingIds.length === 0) return;
    missingIds.forEach((id) => fetchingRef.current.add(id));
    Promise.all(
      missingIds.map(async (id) => {
        const p = await getFirebaseProductById(id).catch(() => null);
        return [id, p ?? getDemoProductById(id) ?? null] as [string, Product | null];
      }),
    ).then((results) => {
      const additions: Record<string, Product> = {};
      for (const [id, product] of results) {
        if (product) additions[id] = product;
        fetchingRef.current.delete(id);
      }
      if (Object.keys(additions).length > 0) {
        setProductCache((prev) => ({ ...prev, ...additions }));
      }
    });
  }, [lines, productCache]);

  const cartLines = useMemo<CartLineView[]>(() => {
    return lines.flatMap((line) => {
      // Look up in Firebase-backed cache first, then fall back to demo catalog
      const product = productCache[line.productId] ?? getDemoProductById(line.productId);
      if (!product) return [];
      const variant = getVariant(product, line.variantId);
      if (!variant) return [];
      return [
        {
          ...line,
          product,
          variant,
          unitPrice: variant.price,
          lineTotal: variant.price * line.quantity,
        },
      ];
    });
  }, [lines, productCache]);

  const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping =
    cartLines.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const addToCart = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === productId && l.variantId === variantId);
        let nextLines: CartLine[];
        if (existing) {
          nextLines = prev.map((l) =>
            l.id === existing.id ? { ...l, quantity: Math.min(l.quantity + quantity, 20) } : l,
          );
        } else {
          const newLine: CartLine = {
            id: `${productId}:${variantId}:${Date.now()}`,
            productId,
            variantId,
            quantity,
          };
          nextLines = [...prev, newLine];
        }

        if (user) {
          const targetLine = nextLines.find(
            (l) => l.productId === productId && l.variantId === variantId,
          );
          if (targetLine) saveCartLine(user.id, targetLine);
        }
        return nextLines;
      });
    },
    [user],
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      setLines((prev) => {
        const target = prev.find((l) => l.id === lineId);
        if (!target) return prev;

        if (quantity <= 0) {
          if (user) removeFirestoreCartLine(user.id, target.productId, target.variantId);
          return prev.filter((l) => l.id !== lineId);
        }

        const nextLines = prev.map((l) =>
          l.id === lineId ? { ...l, quantity: Math.min(quantity, 20) } : l,
        );
        const updatedTarget = nextLines.find((l) => l.id === lineId);
        if (user && updatedTarget) saveCartLine(user.id, updatedTarget);
        return nextLines;
      });
    },
    [user],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      setLines((prev) => {
        const target = prev.find((l) => l.id === lineId);
        if (target && user) {
          removeFirestoreCartLine(user.id, target.productId, target.variantId);
        }
        return prev.filter((l) => l.id !== lineId);
      });
    },
    [user],
  );

  const clearCart = useCallback(() => {
    setLines([]);
    if (user) clearFirestoreCart(user.id);
  }, [user]);

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const added = !wishlist.includes(productId);
      setWishlist((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        if (user) {
          if (added) addToFirestoreWishlist(user.id, productId);
          else removeFromFirestoreWishlist(user.id, productId);
        }
        return next;
      });
      return added;
    },
    [wishlist, user],
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const next = prev.filter((id) => id !== productId);
        if (user) removeFromFirestoreWishlist(user.id, productId);
        return next;
      });
    },
    [user],
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await signInCustomer(email, password);
    if (res.ok) {
      setUser(res.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await signInWithGoogle();
    if (res.ok) {
      setUser(res.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }, []);

  const loginWithGoogleCredential = useCallback(async (idToken: string) => {
    const res = await signInWithGoogleCredential(idToken);
    if (res.ok) {
      setUser(res.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const res = await registerCustomer(input);
      if (res.ok) {
        setUser(res.user);
        return { ok: true };
      }
      return { ok: false, error: res.error };
    },
    [],
  );

  const logout = useCallback(async () => {
    await firebaseSignOut();
    setUser(null);
    setOrders([]);
    setLines(loadGuestCart());
    setWishlist(loadGuestWishlist());
  }, []);

  const updateProfile = useCallback(
    async (input: Partial<Pick<User, "name" | "email" | "phone" | "defaultAddress">>) => {
      if (!user) return;
      setUser((prev) => (prev ? { ...prev, ...input } : prev));
      await updateUserProfile(user.id, input as any);
    },
    [user],
  );

  const placeOrder = useCallback(
    async (
      address: Address,
      paymentMethod: PaymentMethod,
      shippingCost: number,
      couponCode?: string,
    ) => {
      const orderSubtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);

      const orderPayload: any = {
        userId: user?.id,
        address,
        paymentMethod,
        cartLines,
        subtotal: orderSubtotal,
        shipping: shippingCost,
        discount: 0,
        couponCode,
      };

      const res = await createFirestoreOrder(orderPayload);

      if (res.ok) {
        setOrders((prev) => [res.order, ...prev]);
        clearCart();
        return res.order;
      }
      return null;
    },
    [cartLines, user, clearCart],
  );

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const value: StoreValue = {
    hydrated,
    lines,
    cartLines,
    cartCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    addToCart,
    updateQuantity,
    removeLine,
    clearCart,
    cartOpen,
    setCartOpen,
    showLoginPrompt,
    setShowLoginPrompt,
    requestLogin,
    wishlist,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    user,
    login,
    loginWithGoogle,
    loginWithGoogleCredential,
    register,
    logout,
    updateProfile,
    orders,
    placeOrder,
    getOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
