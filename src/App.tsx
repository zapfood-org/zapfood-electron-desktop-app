import { Suspense, lazy } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { LoadingScreen } from "./components/LoadingScreen";
import { RootLayout } from "./layouts/RootLayout";
import { TenantLayout } from "./layouts/TenantLayout";
import { CashWithdrawalPage } from "./pages/CashWithdrawal";
import { CategoriesPage } from "./pages/Categories";
import { CheckoutPage } from "./pages/Checkout";
import { CommissionsPage } from "./pages/Commissions";
import { CouponsPage } from "./pages/Coupons";
import { CreateProductPage } from "./pages/CreateProduct";
import { CustomersPage } from "./pages/Customers";
import { CustomerServicePage } from "./pages/CustomerService";
import { DashboardPage } from "./pages/dashboard";
import { DeliveryDriversPage } from "./pages/DeliveryDrivers";
import { FinancialPage } from "./pages/Financial";
import { InvoiceDetailsPage } from "./pages/InvoiceDetails";
import { InvoicesPage } from "./pages/Invoices";
// import { LoginPage } from "./pages/Login";
import { MembersPage } from "./pages/Members";
import { MenusPage } from "./pages/menus";
import { OrdersPage } from "./pages/orders";

const LoginPage = lazy(() => new Promise<{ default: React.ComponentType }>(resolve => {
  setTimeout(() => {
    resolve(import("./pages/Login").then(module => ({ default: module.LoginPage })));
  }, 3000);
}));
import { PlansPage } from "./pages/Plans";
import { PrintersPage } from "./pages/Printers";
import { ProductsPage } from "./pages/products";
import { PromotionalGamesPage } from "./pages/PromotionalGames";
import { PromotionsPage } from "./pages/Promotions";
import { PushNotificationsPage } from "./pages/PushNotifications";
import { ReportsPage } from "./pages/Reports";
import { RestaurantsPage } from "./pages/Restaurants";
import { SalesReportPage } from "./pages/SalesReport";
import { SettingsPage } from "./pages/settings";
import { SupportPage } from "./pages/Support";
import { WaitersPage } from "./pages/Waiters";
import { WhatsAppPage } from "./pages/WhatsApp";
import { WindowsNotificationsTestPage } from "./pages/WindowsNotificationsTest";
import { EditProductPage } from "./pages/EditProduct";
import { TablesPage } from "./pages/tables";
import { BillsPage } from "./pages/bills";
import { CompaniesLayout } from "./layouts/CompaniesLayout";
import { TableDetailsPage } from "./pages/TableDetails";
import { CompaniesPage } from "./pages/Companies";


export default function App() {
  return (
    <HashRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Navigate to="/login" replace />} />

            {/* Main Layout Wrapper for Companies Context */}
            <Route element={<CompaniesLayout />}>
              {/* Companies List */}
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="companies/settings" element={<div>Settings Placeholder</div>} />

              {/* Tenant Context (nested inside CompaniesLayout) */}
              <Route path=":tenantId" element={<TenantLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="menus" element={<MenusPage />} />
                <Route path="restaurants" element={<RestaurantsPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/create" element={<CreateProductPage />} />
                <Route path="products/:productId/edit" element={<EditProductPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="orders">
                  <Route index element={<OrdersPage />} />
                  <Route path=":orderId/checkout" element={<CheckoutPage />} />
                </Route>
                <Route path="tables" element={<TablesPage />} />
                <Route path="tables/:tableId" element={<TableDetailsPage />} />
                <Route path="bills" element={<BillsPage />} />
                <Route path="delivery-drivers" element={<DeliveryDriversPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="waiters" element={<WaitersPage />} />
                <Route path="promotions" element={<PromotionsPage />} />
                <Route path="coupons" element={<CouponsPage />} />
                <Route path="notifications" element={<PushNotificationsPage />} />
                <Route path="promotional-games" element={<PromotionalGamesPage />} />
                <Route path="financial" element={<FinancialPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/:invoiceId" element={<InvoiceDetailsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="sales-report" element={<SalesReportPage />} />
                <Route path="cash-withdrawal" element={<CashWithdrawalPage />} />
                <Route path="commissions" element={<CommissionsPage />} />
                <Route path="whatsapp" element={<WhatsAppPage />} />
                <Route path="printers" element={<PrintersPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="customer-service" element={<CustomerServicePage />} />
                <Route path="windows-notifications" element={<WindowsNotificationsTestPage />} />
                <Route path="plans" element={<PlansPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
