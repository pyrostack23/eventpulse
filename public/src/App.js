import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer, Bounce } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import './styles/toast.css';

// Main App component with routing and global providers

// Global context providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout components - loaded immediately since they're always needed
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

// Core components - small enough to load immediately
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';
import PageTransition from './components/Layout/PageTransition';

// Lazy load pages for better performance (code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const MyEventsPage = lazy(() => import('./pages/MyEventsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const QRScannerPage = lazy(() => import('./pages/QRScannerPage'));

// Simple loading spinner shown while lazy components load
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%'
  }}>
    <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
  </div>
);

// Routes with page transitions
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth pages (login/register) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            </PageTransition>
          } />
          <Route path="/register" element={
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <RegisterPage />
              </Suspense>
            </PageTransition>
          } />
        </Route>

        {/* Main app pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <HomePage />
              </Suspense>
            </PageTransition>
          } />
          <Route path="/events" element={
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <EventsPage />
              </Suspense>
            </PageTransition>
          } />
          <Route path="/events/:id" element={
            <PageTransition>
              <Suspense fallback={<LoadingFallback />}>
                <EventDetailPage />
              </Suspense>
            </PageTransition>
          } />
          
          {/* Pages that require login */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/profile" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <ProfilePage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/notifications" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <NotificationsPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/my-events" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <MyEventsPage />
                </Suspense>
              </PageTransition>
            } />
          </Route>

          {/* Admin-only pages */}
          <Route element={<AdminRoute />}>
            <Route path="/analytics" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <AnalyticsPage />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/admin" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPanel />
                </Suspense>
              </PageTransition>
            } />
            <Route path="/admin/scanner" element={
              <PageTransition>
                <Suspense fallback={<LoadingFallback />}>
                  <QRScannerPage />
                </Suspense>
              </PageTransition>
            } />
          </Route>
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <AnimatedRoutes />

            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3500}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable={false}
              pauseOnHover
              theme="light"
              transition={Bounce}
              limit={3}
              style={{
                top: '80px',
                right: '20px',
                zIndex: 99999
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
