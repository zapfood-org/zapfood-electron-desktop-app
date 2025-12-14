import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { TenantLayout } from "./layouts/TenantLayout";
import { CategoriesPage } from "./pages/Categories";
import { CommissionsPage } from "./pages/Commissions";
import { CouponsPage } from "./pages/Coupons";
import { CustomersPage } from "./pages/Customers";
import { DashboardPage } from "./pages/dashboard";
import { DeliveryDriversPage } from "./pages/DeliveryDrivers";
import { FinancialPage } from "./pages/Financial";
import { LoginPage } from "./pages/Login";
import { MembersPage } from "./pages/Members";
import { MenusPage } from "./pages/menus";
import { OrdersPage } from "./pages/orders";
import { PlansPage } from "./pages/Plans";
import { PrintersPage } from "./pages/Printers";
import { ProductsPage } from "./pages/products";
import { PromotionalGamesPage } from "./pages/PromotionalGames";
import { PromotionsPage } from "./pages/Promotions";
import { PushNotificationsPage } from "./pages/PushNotifications";
import { ReportsPage } from "./pages/Reports";
import { RestaurantsPage } from "./pages/Restaurants";
import { SettingsPage } from "./pages/settings";
import { SupportPage } from "./pages/Support";
import { WhatsAppPage } from "./pages/WhatsApp";
import { WindowsNotificationsTestPage } from "./pages/WindowsNotificationsTest";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
            <Route path="windows-notifications" element={<WindowsNotificationsTestPage />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}
