import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthRoute from './components/auth/AuthRoute';
import Navbar from './components/layout/Navbar';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Employees from './views/Employees';
import Settings from './views/Settings';
import Pricing from './views/Pricing';
import AdminUsers from './views/AdminUsers';

function AppLayout() {
  const [employeeCount, setEmployeeCount] = useState(0);

  return (
    <div className="flex min-h-screen">
      <Navbar employeeCount={employeeCount} />
      <main className="flex-1 p-6 transition-all duration-300">
        <Routes>
          <Route path="/" element={<AuthRoute><Dashboard onCountChange={setEmployeeCount} /></AuthRoute>} />
          <Route path="/employees" element={<AuthRoute><Employees onCountChange={setEmployeeCount} /></AuthRoute>} />
          <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
          <Route path="/pricing" element={<AuthRoute><Pricing /></AuthRoute>} />
          <Route path="/admin/users" element={<AuthRoute><AdminUsers /></AuthRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
