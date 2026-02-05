import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { CreditsProvider } from './context/CreditsContext.jsx'
import NotificationToast from './components/notifications/NotificationToast'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import EmployerRegister from './pages/EmployerRegister'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Castings from './pages/Castings'
import Models from './pages/Models'
import CastingDetail from './pages/CastingDetail'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import ModelOnboarding from './pages/ModelOnboarding'
import EmployerOnboarding from './pages/EmployerOnboarding'
import Subscriptions from './pages/Subscriptions'
import Checkout from './pages/Checkout'
import Photostudios from './pages/Photostudios'
import Advertising from './pages/Advertising'
import CreatePromotion from './pages/CreatePromotion'
import Chat from './pages/Chat'
import CreateCasting from './pages/CreateCasting'
import MyCastings from './pages/MyCastings'
import MyApplications from './pages/MyApplications'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import PaymentRedirect from './components/payment/PaymentRedirect'

// Layout
import Layout from './components/layout/Layout'
import EmployerGuard from './components/EmployerGuard'
import EmployerPendingStatus from './components/EmployerPendingStatus'

// Settings (lazy loaded)
const NotificationSettings = lazy(() => import('./pages/settings/NotificationSettings'))
const SubscriptionManagement = lazy(() => import('./pages/settings/SubscriptionManagement'))

// Admin (lazy loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminLeads = lazy(() => import('./pages/admin/Leads'))
const AdminLeadDetail = lazy(() => import('./pages/admin/LeadDetail'))
const AdminModeration = lazy(() => import('./pages/admin/Moderation'))
const EmployerModeration = lazy(() => import('./pages/admin/EmployerModeration'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminFinance = lazy(() => import('./pages/admin/Finance'))

// Agency (lazy loaded)
const AgencyDashboard = lazy(() => import('./pages/agency/AgencyDashboard'))
const AgencyProfile = lazy(() => import('./pages/agency/AgencyProfile'))
const TeamManagement = lazy(() => import('./pages/agency/TeamManagement'))
const AgencyPublic = lazy(() => import('./pages/AgencyPublic'))

// Employer
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'))

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

// Employer Protected Route wrapper (checks employer status)
function EmployerProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // If user is employer with non-verified status, show pending screen
    if (user.role === 'employer' && user.user_verification_status !== 'verified') {
        return <EmployerPendingStatus />
    }

    return children
}

// Admin Guard
function AdminGuard({ children }) {
    const { adminUser, loading } = useAdminAuth()

    if (loading) {
        return <div className="loading">Загрузка...</div>
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />
    }

    const adminRoles = ['admin', 'super_admin', 'moderator', 'support']
    if (!adminRoles.includes(adminUser.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <CreditsProvider>
            <ChatProvider>
                <NotificationProvider>
                    <NotificationToast />
                    <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register-employer" element={<EmployerRegister />} />
                    <Route path="/verify-email" element={<ProtectedRoute><VerifyEmail /></ProtectedRoute>} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/payment/redirect" element={<PaymentRedirect paymentUrl="https://kaspi.kz/payment/test" amount={4990} />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failed" element={<PaymentFailed />} />
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Onboarding routes - accessible without authentication */}
                    <Route path="/onboarding/model" element={<ModelOnboarding />} />
                    <Route path="/onboarding/employer" element={<EmployerOnboarding />} />

                    {/* Protected routes with Layout */}
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="castings" element={<Castings />} />
                        <Route path="castings/create" element={
                            <EmployerProtectedRoute>
                                <CreateCasting />
                            </EmployerProtectedRoute>
                        } />
                        <Route path="castings/edit/:id" element={
                            <EmployerProtectedRoute>
                                <CreateCasting />
                            </EmployerProtectedRoute>
                        } />
                        <Route path="castings/my" element={
                            <EmployerProtectedRoute>
                                <MyCastings />
                            </EmployerProtectedRoute>
                        } />
                        <Route path="castings/:id" element={<CastingDetail />} />
                        <Route path="models" element={<Models />} />
                        <Route path="applications" element={<MyApplications />} />
                        <Route path="photostudios" element={<Photostudios />} />
                        <Route path="advertising" element={<Advertising />} />
                        <Route path="advertising/create" element={<CreatePromotion />} />
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
                        <Route path="settings/subscription" element={
                            <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                <SubscriptionManagement />
                            </Suspense>
                        } />

                        {/* Employer Dashboard - only for approved employers */}
                        <Route path="employer" element={
                            <EmployerProtectedRoute>
                                <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                    <EmployerDashboard />
                                </Suspense>
                            </EmployerProtectedRoute>
                        } />

                        {/* Agency routes */}
                        <Route path="agency" element={
                            <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                <AgencyDashboard />
                            </Suspense>
                        } />
                        <Route path="agency/profile" element={
                            <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                <AgencyProfile />
                            </Suspense>
                        } />
                        <Route path="agency/team" element={
                            <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                <TeamManagement />
                            </Suspense>
                        } />

                        {/* Public agency page */}
                        <Route path="agencies/:id" element={
                            <Suspense fallback={<div className="loading">Загрузка...</div>}>
                                <AgencyPublic />
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
                            <AdminAuthProvider>
                                <AdminGuard>
                                    <AdminLayout />
                                </AdminGuard>
                            </AdminAuthProvider>
                        </Suspense>
                    }>
                        <Route index element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminDashboard /></Suspense>} />
                        <Route path="leads" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminLeads /></Suspense>} />
                        <Route path="leads/:id" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminLeadDetail /></Suspense>} />
                        <Route path="moderation" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminModeration /></Suspense>} />
                        <Route path="employers" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><EmployerModeration /></Suspense>} />
                        <Route path="users" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminUsers /></Suspense>} />
                        <Route path="reports" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminReports /></Suspense>} />
                        <Route path="finance" element={<Suspense fallback={<div className="loading">Загрузка...</div>}><AdminFinance /></Suspense>} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </ChatProvider>
    </CreditsProvider>
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
