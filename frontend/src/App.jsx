import { Routes, Route } from "react-router-dom";
import DocumentLang from "./components/DocumentLang.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import HomePage from "./pages/HomePage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryProductsPage from "./pages/CategoryProductsPage.jsx";
import BrandsPage from "./pages/BrandsPage.jsx";
import BrandProductsPage from "./pages/BrandProductsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import FaqsPage from "./pages/FaqsPage.jsx";
import BlogListPage from "./pages/BlogListPage.jsx";
import BlogPostPage from "./pages/BlogPostPage.jsx";
import ShopProductPage from "./pages/ShopProductPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminBrands from "./pages/admin/AdminBrands.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminHomeHero from "./pages/admin/AdminHomeHero.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminInventory from "./pages/admin/AdminInventory.jsx";
import AdminBlog from "./pages/admin/AdminBlog.jsx";
import AdminCmsPageEditor from "./pages/admin/AdminCmsPageEditor.jsx";
import AdminStoreSettings from "./pages/admin/AdminStoreSettings.jsx";
import AdminContactMessages from "./pages/admin/AdminContactMessages.jsx";
import AdminNewsletterSubscribers from "./pages/admin/AdminNewsletterSubscribers.jsx";
import RequireCustomer from "./components/RequireCustomer.jsx";
import AccountLayout from "./pages/account/AccountLayout.jsx";
import AccountDashboard from "./pages/account/AccountDashboard.jsx";
import AccountProfile from "./pages/account/AccountProfile.jsx";
import AccountAddresses from "./pages/account/AccountAddresses.jsx";
import AccountOrders from "./pages/account/AccountOrders.jsx";
import StoreChatWidget from "./components/StoreChatWidget.jsx";

export default function App() {
  return (
    <div className="min-h-dvh w-full min-w-0">
      <DocumentLang />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:slug" element={<CategoryProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/brands/:slug" element={<BrandProductsPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/faqs" element={<FaqsPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ShopProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RequireCustomer />}>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountDashboard />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="addresses" element={<AccountAddresses />} />
          </Route>
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="home-hero" element={<AdminHomeHero />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="contact-messages" element={<AdminContactMessages />} />
            <Route path="newsletter-subscribers" element={<AdminNewsletterSubscribers />} />
            <Route path="support/:pageKey" element={<AdminCmsPageEditor />} />
            <Route path="store-settings" element={<AdminStoreSettings />} />
          </Route>
        </Route>
      </Routes>
      <StoreChatWidget />
    </div>
  );
}
