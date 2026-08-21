import { createContext, useContext, useState, useEffect } from "react";
import { wishlistApi } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      wishlistApi
        .get()
        .then((res) => {
          const fetchedItems = res.data?.items ?? [];
          const formatted = fetchedItems.map((item) => {
            const prod = item.product || {};
            return {
              productId: item.productId,
              name: prod.name || "",
              price: Number(prod.basePrice || 0),
              image: Array.isArray(prod.images) ? prod.images[0] : prod.images || ""
            };
          });
          setItems(formatted);
        })
        .catch((err) => console.error("Failed to load wishlist from server", err));
    } else {
      setItems([]);
    }
  }, [user]);

  const toggle = async (item) => {
    const isWished = items.some((i) => i.productId === item.productId);
    if (user) {
      try {
        if (isWished) {
          await wishlistApi.remove(item.productId);
          setItems((prev) => prev.filter((i) => i.productId !== item.productId));
        } else {
          await wishlistApi.add(item.productId);
          setItems((prev) => [...prev, item]);
        }
      } catch (err) {
        console.error("Failed to update wishlist on server", err);
      }
    } else {
      // Local fallback for guest
      setItems((prev) =>
        isWished ? prev.filter((i) => i.productId !== item.productId) : [...prev, item]
      );
    }
  };

  const isWishlisted = (productId) => items.some((i) => i.productId === productId);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

export { WishlistProvider, useWishlist };

