import React, { useState, Component, Suspense, lazy, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthRoute from './components/auth/AuthRoute';
import Navbar from './components/layout/Navbar';

const Login = lazy(() => import('./views/Login'));
const Dashboard = lazy(() => import('./views/Dashboard'));
const AdminDashboard = lazy(() => import('./views/AdminDashboard'));
const Employees = lazy(() => import('./views/Employees'));
const Settings = lazy(() => import('./views/Settings'));
const Pricing = lazy(() => import('./views/Pricing'));
const AdminUsers = lazy(() => import('./views/AdminUsers'));
const Analytics = lazy(() => import('./views/Analytics'));

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-corp-blue dark:border-cobalt-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
  const { appUser } = useAuth();
  const [employeeCount, setEmployeeCount] = useState(0);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Navbar employeeCount={employeeCount} />
      <main className="flex-1 p-6 transition-all duration-300 min-w-0 max-w-full overflow-x-hidden">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <AuthRoute>
                  {appUser?.role === 'admin' ? (
                    <AdminDashboard />
                  ) : (
                    <Dashboard onCountChange={setEmployeeCount} />
                  )}
                </AuthRoute>
              }
            />
            <Route path="/admin" element={<AuthRoute><AdminDashboard /></AuthRoute>} />
            <Route path="/employees" element={<AuthRoute><Employees onCountChange={setEmployeeCount} /></AuthRoute>} />
            <Route path="/analytics" element={<AuthRoute><Analytics /></AuthRoute>} />
            <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
            <Route path="/pricing" element={<AuthRoute><Pricing /></AuthRoute>} />
            <Route path="/admin/users" element={<AuthRoute><AdminUsers /></AuthRoute>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
