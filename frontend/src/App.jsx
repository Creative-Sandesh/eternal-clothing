import { RouterProvider } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { router } from "./routes";
function App() {
  return <CartProvider>
      <WishlistProvider>
        <RouterProvider router={router} />
      </WishlistProvider>
    </CartProvider>;
}
export {
  App as default
};
