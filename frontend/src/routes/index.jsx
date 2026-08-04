import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";
import AccountLayout from "../layouts/AccountLayout";
import AdminLayout from "../layouts/AdminLayout";
const HomePage = lazy(() => import("../pages/customer/HomePage"));
const ShopPage = lazy(() => import("../pages/customer/ShopPage"));
const CollectionsPage = lazy(() => import("../pages/customer/CollectionsPage"));
const CollectionDetailPage = lazy(() => import("../pages/customer/CollectionDetailPage"));
const CategoriesPage = lazy(() => import("../pages/customer/CategoriesPage"));
const NewArrivalsPage = lazy(() => import("../pages/customer/NewArrivalsPage"));
const BestSellersPage = lazy(() => import("../pages/customer/BestSellersPage"));
const SalePage = lazy(() => import("../pages/customer/SalePage"));
const ProductDetailPage = lazy(() => import("../pages/customer/ProductDetailPage"));
const SearchPage = lazy(() => import("../pages/customer/SearchPage"));
const CartPage = lazy(() => import("../pages/customer/CartPage"));
const CheckoutPage = lazy(() => import("../pages/customer/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("../pages/customer/OrderConfirmationPage"));
const WishlistPage = lazy(() => import("../pages/customer/WishlistPage"));
const BlogListPage = lazy(() => import("../pages/customer/BlogListPage"));
const BlogDetailPage = lazy(() => import("../pages/customer/BlogDetailPage"));
const AboutPage = lazy(() => import("../pages/customer/AboutPage"));
const ContactPage = lazy(() => import("../pages/customer/ContactPage"));
const FAQPage = lazy(() => import("../pages/customer/FAQPage"));
const ShippingPolicyPage = lazy(() => import("../pages/customer/ShippingPolicyPage"));
const ReturnPolicyPage = lazy(() => import("../pages/customer/ReturnPolicyPage"));
const PrivacyPage = lazy(() => import("../pages/customer/PrivacyPage"));
const TermsPage = lazy(() => import("../pages/customer/TermsPage"));
const StoreLocatorPage = lazy(() => import("../pages/customer/StoreLocatorPage"));
const LoginPage = lazy(() => import("../pages/customer/LoginPage"));
const RegisterPage = lazy(() => import("../pages/customer/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/customer/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/customer/ResetPasswordPage"));
const NotFoundPage = lazy(() => import("../pages/customer/NotFoundPage"));
const AccountDashboard = lazy(() => import("../pages/customer/AccountDashboard"));
const OrdersPage = lazy(() => import("../pages/customer/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/customer/OrderDetailPage"));
const ProfilePage = lazy(() => import("../pages/customer/ProfilePage"));
const AddressesPage = lazy(() => import("../pages/customer/AddressesPage"));
const LoyaltyPage = lazy(() => import("../pages/customer/LoyaltyPage"));
const NotificationsPage = lazy(() => import("../pages/customer/NotificationsPage"));
const PaymentMethodsPage = lazy(() => import("../pages/customer/PaymentMethodsPage"));
const MyReviewsPage = lazy(() => import("../pages/customer/MyReviewsPage"));
const ChangePasswordPage = lazy(() => import("../pages/customer/ChangePasswordPage"));
const ReferralPage = lazy(() => import("../pages/customer/ReferralPage"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ProductsListPage = lazy(() => import("../pages/admin/ProductsListPage"));
const AddEditProductPage = lazy(() => import("../pages/admin/AddEditProductPage"));
const CategoriesAdminPage = lazy(() => import("../pages/admin/CategoriesPage"));
const CollectionsAdminPage = lazy(() => import("../pages/admin/CollectionsAdminPage"));
const OrdersListPage = lazy(() => import("../pages/admin/OrdersListPage"));
const OrderDetailAdminPage = lazy(() => import("../pages/admin/OrderDetailAdminPage"));
const CustomersListPage = lazy(() => import("../pages/admin/CustomersListPage"));
const CustomerDetailPage = lazy(() => import("../pages/admin/CustomerDetailPage"));
const ReviewsPage = lazy(() => import("../pages/admin/ReviewsPage"));
const CouponsPage = lazy(() => import("../pages/admin/CouponsPage"));
const MarketingPage = lazy(() => import("../pages/admin/MarketingPage"));
const AnalyticsDashboard = lazy(() => import("../pages/admin/AnalyticsDashboard"));
const InventoryPage = lazy(() => import("../pages/admin/InventoryPage"));
const UsersPage = lazy(() => import("../pages/admin/UsersPage"));
const SettingsPage = lazy(() => import("../pages/admin/SettingsPage"));
const router = createBrowserRouter([
  {
    Component: CustomerLayout,
    children: [
      { path: "/", Component: HomePage },
      { path: "/shop", Component: ShopPage },
      { path: "/collections", Component: CollectionsPage },
      { path: "/collections/:slug", Component: CollectionDetailPage },
      { path: "/categories", Component: CategoriesPage },
      { path: "/new-arrivals", Component: NewArrivalsPage },
      { path: "/best-sellers", Component: BestSellersPage },
      { path: "/sale", Component: SalePage },
      { path: "/products/:id", Component: ProductDetailPage },
      { path: "/search", Component: SearchPage },
      { path: "/cart", Component: CartPage },
      { path: "/checkout", Component: CheckoutPage },
      { path: "/order-confirmation", Component: OrderConfirmationPage },
      { path: "/wishlist", Component: WishlistPage },
      { path: "/blog", Component: BlogListPage },
      { path: "/blog/:slug", Component: BlogDetailPage },
      { path: "/about", Component: AboutPage },
      { path: "/contact", Component: ContactPage },
      { path: "/faq", Component: FAQPage },
      { path: "/shipping-policy", Component: ShippingPolicyPage },
      { path: "/returns-policy", Component: ReturnPolicyPage },
      { path: "/privacy-policy", Component: PrivacyPage },
      { path: "/terms", Component: TermsPage },
      { path: "/store-locator", Component: StoreLocatorPage },
      { path: "/login", Component: LoginPage },
      { path: "/register", Component: RegisterPage },
      { path: "/forgot-password", Component: ForgotPasswordPage },
      { path: "/reset-password", Component: ResetPasswordPage },
      { path: "*", Component: NotFoundPage }
    ]
  },
  {
    Component: AccountLayout,
    children: [
      { path: "/account", Component: AccountDashboard },
      { path: "/account/orders", Component: OrdersPage },
      { path: "/account/orders/:id", Component: OrderDetailPage },
      { path: "/account/profile", Component: ProfilePage },
      { path: "/account/addresses", Component: AddressesPage },
      { path: "/account/wishlist", Component: WishlistPage },
      { path: "/account/loyalty", Component: LoyaltyPage },
      { path: "/account/notifications", Component: NotificationsPage },
      { path: "/account/payment-methods", Component: PaymentMethodsPage },
      { path: "/account/reviews", Component: MyReviewsPage },
      { path: "/account/change-password", Component: ChangePasswordPage },
      { path: "/account/referral", Component: ReferralPage },
      { path: "/account/settings", Component: ProfilePage }
    ]
  },
  {
    Component: AdminLayout,
    children: [
      { path: "/admin", Component: AdminDashboard },
      { path: "/admin/products", Component: ProductsListPage },
      { path: "/admin/products/new", Component: AddEditProductPage },
      { path: "/admin/products/:id/edit", Component: AddEditProductPage },
      { path: "/admin/categories", Component: CategoriesAdminPage },
      { path: "/admin/collections", Component: CollectionsAdminPage },
      { path: "/admin/orders", Component: OrdersListPage },
      { path: "/admin/orders/:id", Component: OrderDetailAdminPage },
      { path: "/admin/customers", Component: CustomersListPage },
      { path: "/admin/customers/:id", Component: CustomerDetailPage },
      { path: "/admin/reviews", Component: ReviewsPage },
      { path: "/admin/coupons", Component: CouponsPage },
      { path: "/admin/marketing", Component: MarketingPage },
      { path: "/admin/analytics", Component: AnalyticsDashboard },
      { path: "/admin/inventory", Component: InventoryPage },
      { path: "/admin/users", Component: UsersPage },
      { path: "/admin/settings", Component: SettingsPage }
    ]
  }
]);
export {
  router
};
