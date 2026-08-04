import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
function PageSpinner() {
  return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#f0ebe2] border-t-[#2d4a3e] animate-spin" />
    </div>;
}
function CustomerLayout() {
  return <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </>;
}
export {
  CustomerLayout as default
};
