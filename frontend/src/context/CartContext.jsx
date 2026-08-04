import { createContext, useContext, useState } from "react";
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.size === item.size && i.color === item.color);
      if (existing) return prev.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, { ...item, id: `${item.productId}-${item.size}-${item.color}-${Date.now()}` }];
    });
    setIsOpen(true);
  };
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setItems([]);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>;
}
function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
export {
  CartProvider,
  useCart
};
