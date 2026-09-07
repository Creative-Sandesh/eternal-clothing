import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SettingsProvider } from "./context/SettingsContext";
import { router } from "./routes";

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RouterProvider router={router} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export { App as default };
