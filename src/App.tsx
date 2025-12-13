import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { TenantLayout } from "./layouts/TenantLayout";
import { DashboardPage } from "./pages/dashboard";
import { OrdersPage } from "./pages/orders";
import { RestaurantsPage } from "./pages/Restaurants";
import { ProductsPage } from "./pages/products";
import { MenusPage } from "./pages/menus";
import { SettingsPage } from "./pages/settings";
import { CategoriesPage } from "./pages/Categories";
import { CustomersPage } from "./pages/Customers";
import { DeliveryDriversPage } from "./pages/DeliveryDrivers";
import { MembersPage } from "./pages/Members";
import { PromotionsPage } from "./pages/Promotions";
import { CouponsPage } from "./pages/Coupons";
import { PushNotificationsPage } from "./pages/PushNotifications";
import { PromotionalGamesPage } from "./pages/PromotionalGames";
import { FinancialPage } from "./pages/Financial";
import { ReportsPage } from "./pages/Reports";
import { CommissionsPage } from "./pages/Commissions";
import { WhatsAppPage } from "./pages/WhatsApp";
import { PrintersPage } from "./pages/Printers";
import { SupportPage } from "./pages/Support";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="/1/dashboard" replace />} />
          <Route path=":tenantId" element={<TenantLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="menus" element={<MenusPage />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="delivery-drivers" element={<DeliveryDriversPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="notifications" element={<PushNotificationsPage />} />
            <Route path="promotional-games" element={<PromotionalGamesPage />} />
            <Route path="financial" element={<FinancialPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="commissions" element={<CommissionsPage />} />
            <Route path="whatsapp" element={<WhatsAppPage />} />
            <Route path="printers" element={<PrintersPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}
