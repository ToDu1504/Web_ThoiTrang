import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './pages/customer/Home';
import { ProductListPage } from './pages/customer/ProductList';
import { ProductDetailPage } from './pages/customer/ProductDetail';
import { CartPage } from './pages/customer/Cart';
import { CheckoutPage } from './pages/customer/Checkout';
import { WishlistPage } from './pages/customer/Wishlist';
import { OrdersPage } from './pages/customer/Orders';
import { OrderDetailPage } from './pages/customer/OrderDetail';
import { PaymentResultPage } from './pages/customer/PaymentResult';
import { LoginPage } from './pages/customer/Login';
import { RegisterPage } from './pages/customer/Register';
import { AdminDashboardPage } from './pages/admin/Dashboard';
import { AdminProductsPage } from './pages/admin/Products';
import { AdminCategoriesPage } from './pages/admin/Categories';
import { AdminBrandsPage } from './pages/admin/Brands';
import { AdminOrdersPage } from './pages/admin/Orders';
import { AdminVouchersPage } from './pages/admin/Vouchers';
import { AdminUsersPage } from './pages/admin/Users';
import { NotFoundPage } from './pages/NotFound';

const ADMIN_ROLES = ['ROLE_ADMIN', 'ROLE_STAFF'];

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="payment/vnpay-return" element={<PaymentResultPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<ProtectedRoute requireAnyRole={ADMIN_ROLES} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
