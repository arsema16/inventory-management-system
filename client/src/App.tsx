import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

// Inventory
import InventoryList from './pages/Inventory/InventoryList';
import InventoryForm from './pages/Inventory/InventoryForm';
import InventoryDetail from './pages/Inventory/InventoryDetail';

// Vehicles
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';

// Requests
import RequestList from './pages/Requests/RequestList';
import RequestForm from './pages/Requests/RequestForm';
import RequestDetail from './pages/Requests/RequestDetail';

// Vehicle Sales
import SalesList from './pages/Sales/SalesList';
import SaleForm from './pages/Sales/SaleForm';
import SaleDetail from './pages/Sales/SaleDetail';

// Approvals
import ApprovalCenter from './pages/Approvals/ApprovalCenter';

// Users & Departments
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import DepartmentList from './pages/Departments/DepartmentList';
import DepartmentForm from './pages/Departments/DepartmentForm';

// Reports & Audit
import ReportsList from './pages/Reports/ReportsList';
import AuditLogs from './pages/Audit/AuditLogs';
import StockManagement from './pages/Stock/StockManagement';
import NotificationsPage from './pages/Notifications/NotificationsPage';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Inventory */}
            <Route path="inventory" element={<InventoryList />} />
            <Route path="inventory/new" element={<InventoryForm />} />
            <Route path="inventory/:id" element={<InventoryDetail />} />
            <Route path="inventory/edit/:id" element={<InventoryForm />} />
            
            {/* Vehicles */}
            <Route path="vehicles" element={<VehicleList />} />
            <Route path="vehicles/new" element={<VehicleForm />} />
            <Route path="vehicles/edit/:id" element={<VehicleForm />} />
            
            {/* Requests */}
            <Route path="requests" element={<RequestList />} />
            <Route path="requests/new" element={<RequestForm />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            
            {/* Vehicle Sales */}
            <Route path="sales" element={<SalesList />} />
            <Route path="sales/new" element={<SaleForm />} />
            <Route path="sales/:id" element={<SaleDetail />} />
            
            {/* Approvals */}
            <Route path="approvals" element={<ApprovalCenter />} />
            
            {/* Users & Management */}
            <Route path="users" element={<UserList />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            <Route path="departments" element={<DepartmentList />} />
            <Route path="departments/new" element={<DepartmentForm />} />
            <Route path="departments/edit/:id" element={<DepartmentForm />} />
            <Route path="reports" element={<ReportsList />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
