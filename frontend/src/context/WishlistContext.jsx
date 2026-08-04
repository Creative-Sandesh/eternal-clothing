import { createContext, useContext, useState } from "react";
const WishlistContext = createContext(null);
function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const toggle = (item) => {
    setItems((prev) => prev.some((i) => i.productId === item.productId) ? prev.filter((i) => i.productId !== item.productId) : [...prev, item]);
  };
  const isWishlisted = (productId) => items.some((i) => i.productId === productId);
  return <WishlistContext.Provider value={{ items, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>;
}
function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
export {
  WishlistProvider,
  useWishlist
};
