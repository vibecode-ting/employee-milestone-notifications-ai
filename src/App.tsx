import React, { useState, Component, type ReactNode } from 'react';
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

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
          <div className="max-w-md w-full glass-panel p-8 text-center space-y-4">
            <h2 className="text-xl font-bold text-red-500">Something went wrong</h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {this.state.error?.message || 'An unexpected error occurred while loading the application.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm px-4 py-2"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppLayout() {
  const [employeeCount, setEmployeeCount] = useState(0);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Navbar employeeCount={employeeCount} />
      <main className="flex-1 p-6 transition-all duration-300 min-w-0 max-w-full overflow-x-hidden">
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
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
