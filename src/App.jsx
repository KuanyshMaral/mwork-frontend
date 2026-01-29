import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import NotificationToast from './components/notifications/NotificationToast'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Castings from './pages/Castings'
import CastingDetail from './pages/CastingDetail'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Subscriptions from './pages/Subscriptions'
import Checkout from './pages/Checkout'
import Photostudios from './pages/Photostudios'
import Advertising from './pages/Advertising'
import Chat from './pages/Chat'
import CreateCasting from './pages/CreateCasting'
import MyCastings from './pages/MyCastings'
import MyApplications from './pages/MyApplications'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import PaymentRedirect from './components/payment/PaymentRedirect'

// Layout
import Layout from './components/layout/Layout'

// Settings (lazy loaded)
const NotificationSettings = lazy(() => import('./pages/settings/NotificationSettings'))

// Admin (lazy loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminLeads = lazy(() => import('./pages/admin/Leads'))
const AdminLeadDetail = lazy(() => import('./pages/admin/LeadDetail'))
const AdminModeration = lazy(() => import('./pages/admin/Moderation'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

// Admin Guard
function AdminGuard({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />
    }

    const adminRoles = ['admin', 'super_admin', 'moderator', 'support']
    if (!adminRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <ChatProvider>
            <NotificationProvider>
                <NotificationToast />
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<ProtectedRoute><VerifyEmail /></ProtectedRoute>} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/payment/redirect" element={<PaymentRedirect paymentUrl="https://kaspi.kz/payment/test" amount={4990} />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failed" element={<PaymentFailed />} />
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Protected routes with Layout */}
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="castings" element={<Castings />} />
                        <Route path="castings/create" element={<CreateCasting />} />
                        <Route path="castings/edit/:id" element={<CreateCasting />} />
                        <Route path="castings/my" element={<MyCastings />} />
                        <Route path="castings/:id" element={<CastingDetail />} />
                        <Route path="applications" element={<MyApplications />} />
                        <Route path="photostudios" element={<Photostudios />} />
                        <Route path="advertising" element={<Advertising />} />
                        <Route path="messages" element={<Chat />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="profile/edit" element={<ProfileEdit />} />
                        <Route path="profile/:id" element={<Profile />} />
                        <Route path="subscriptions" element={<Subscriptions />} />

                        {/* Settings routes */}
                        <Route path="settings/notifications" element={
                            <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                <NotificationSettings />
                            </Suspense>
                        } />
                    </Route>

                    {/* Admin routes (lazy loaded) */}
                    <Route path="/admin/login" element={
                        <Suspense fallback={<div className="loading">Загрузка...</div>}>
                            <AdminLogin />
                        </Suspense>
                    } />

                    <Route path="/admin" element={
                        <Suspense fallback={<div className="loading">Загрузка...</div>}>
                            <AdminGuard>
                                <AdminLayout />
                            </AdminGuard>
                        </Suspense>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="leads" element={<AdminLeads />} />
                        <Route path="leads/:id" element={<AdminLeadDetail />} />
                        <Route path="moderation" element={<AdminModeration />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="reports" element={<AdminReports />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </ChatProvider>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
