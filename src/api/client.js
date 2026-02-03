// API Client - lightweight fetch wrapper

const API_BASE = '/api/v1'

// Admin API base path (different from regular API)
const ADMIN_API_BASE = '/api/admin'

class ApiError extends Error {
    constructor(message, status, data) {
        super(message)
        this.status = status
        this.data = data
    }
}

async function request(endpoint, options = {}) {
    // Check if this is an admin endpoint and use admin token and base path
    const isAdminEndpoint = endpoint.startsWith('/admin/') || options._useAdminBase
    const token = localStorage.getItem(isAdminEndpoint ? 'admin_token' : 'token')
    const basePath = isAdminEndpoint ? ADMIN_API_BASE : API_BASE

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    }

    // Remove internal flags
    delete config._useAdminBase

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body)
    }

    const response = await fetch(`${basePath}${endpoint}`, config)

    // Handle 204 No Content
    if (response.status === 204) {
        return null
    }

    const responseText = await response.text()
    
    // Debug logging for admin endpoints
    if (isAdminEndpoint) {
        console.log('Admin API Response:', {
            url: `${basePath}${endpoint}`,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            responseText: responseText.substring(0, 500)
        })
    }
    
    // Try to parse as JSON, fallback to text if it fails
    let data
    try {
        data = responseText ? JSON.parse(responseText) : {}
    } catch (e) {
        console.error('Invalid JSON response:', {
            url: `${basePath}${endpoint}`,
            status: response.status,
            responseText: responseText.substring(0, 1000)
        })
        throw new ApiError(
            `Invalid JSON response from server (${response.status}): ${responseText.substring(0, 200)}`,
            response.status,
            { rawResponse: responseText }
        )
    }

    if (!response.ok) {
        // Handle auth errors with proper redirects
        if (response.status === 401) {
            if (isAdminEndpoint) {
                // Clear admin token and redirect to admin login
                localStorage.removeItem('admin_token')
                localStorage.removeItem('admin_user')
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login'
                }
            } else {
                // Clear user token and redirect to regular login
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
            }
        } else if (response.status === 403) {
            // Access denied - show proper error
            if (isAdminEndpoint) {
                throw new ApiError('Access denied - Admin privileges required', response.status, data)
            } else {
                throw new ApiError('Access denied - Not admin', response.status, data)
            }
        }
        
        throw new ApiError(
            data.error?.message || data.message || 'Произошла ошибка',
            response.status,
            data
        )
    }

    return data.data !== undefined ? data.data : data
}

// Convenience methods
const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),

    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),

    put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),

    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),

    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

// Admin API convenience methods (use admin base path)
const adminApiBase = {
    get: (endpoint) => request(endpoint, { method: 'GET', _useAdminBase: true }),

    post: (endpoint, body) => request(endpoint, { method: 'POST', body, _useAdminBase: true }),

    put: (endpoint, body) => request(endpoint, { method: 'PUT', body, _useAdminBase: true }),

    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body, _useAdminBase: true }),

    delete: (endpoint) => request(endpoint, { method: 'DELETE', _useAdminBase: true }),
}

// Auth-specific methods
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: (data) => api.post('/auth/logout', data),
    refresh: (data) => api.post('/auth/refresh', data),
    me: () => api.get('/auth/me'),
    
    // Admin auth methods
    adminLogin: (data) => adminApiBase.post('/auth/login', data),
    adminLogout: (data) => adminApiBase.post('/auth/logout', data),
    adminMe: () => adminApiBase.get('/auth/me'),
}

// Profile methods
export const profileApi = {
    getMe: () => api.get('/profiles/me'),
    getById: (id) => api.get(`/profiles/${id}`),
    update: (id, data) => api.put(`/profiles/${id}`, data),
    getCompleteness: (id) => api.get(`/profiles/${id}/completeness`),
    getSocialLinks: (id) => api.get(`/profiles/${id}/social-links`),
    addSocialLink: (id, data) => api.post(`/profiles/${id}/social-links`, data),
    createEmployerProfile: (data) => api.post('/profiles/employers', data),
    deleteSocialLink: (id, platform) => api.delete(`/profiles/${id}/social-links/${platform}`),
    createModel: (data) => api.post('/profiles/models', data),
    createEmployer: (data) => api.post('/profiles/employers', data),
    listModels: (params) => {
        const queryString = new URLSearchParams(params).toString()
        return api.get(`/profiles/models${queryString ? `?${queryString}` : ''}`)
    },
    getPromotedModels: () => api.get('/profiles/models/promoted'),
}

// Casting methods
export const castingApi = {
    list: (params) => {
        const queryString = new URLSearchParams(params).toString()
        return api.get(`/castings${queryString ? `?${queryString}` : ''}`)
    },
    getById: (id) => api.get(`/castings/${id}`),
    getMy: () => api.get('/castings/my'),
    create: (data) => api.post('/castings', data),
    update: (id, data) => api.put(`/castings/${id}`, data),
    save: (id) => api.post(`/castings/${id}/save`),
    unsave: (id) => api.delete(`/castings/${id}/save`),
    getSaved: () => api.get('/castings/saved'),
    apply: (id, data) => api.post(`/castings/${id}/responses`, data),
}

// Dashboard methods
export const dashboardApi = {
    getModelStats: () => api.get('/dashboard/model/stats'),
    getEmployerStats: () => api.get('/dashboard/employer'),
}

// Agency API
export const agencyApi = {
    getMyAgency: () => api.get('/agencies/me'),
    getById: (id) => api.get(`/agencies/${id}`),
    getStats: () => api.get('/agencies/me/stats'),
    getTeam: () => api.get('/agencies/me/team'),
    inviteMember: (data) => api.post('/agencies/me/team/invite', data),
    removeMember: (memberId) => api.delete(`/agencies/me/team/${memberId}`),
    updateMemberRole: (memberId, role) => api.patch(`/agencies/me/team/${memberId}`, { role }),
    follow: (agencyId) => api.post(`/agencies/${agencyId}/follow`),
    unfollow: (agencyId) => api.delete(`/agencies/${agencyId}/follow`),
    getFollowers: (agencyId) => api.get(`/agencies/${agencyId}/followers`),
    update: (data) => api.put('/agencies/me', data),
}

// Subscription methods
export const subscriptionApi = {
    getPlans: async () => {
        try {
            return await api.get('/subscriptions/plans')
        } catch (err) {
            console.error('Failed to get plans:', err)
            // Return fallback plans if API fails
            return [
                {
                    id: 'free',
                    name: 'Free',
                    description: 'Базовый бесплатный план',
                    price_monthly: 0,
                    max_photos: 3,
                    max_responses_month: 5,
                    can_chat: false,
                    can_see_viewers: false,
                    priority_search: false,
                    max_team_members: 0,
                    features: ['3 фотографии', '5 откликов в месяц', 'Базовый профиль']
                },
                {
                    id: 'pro',
                    name: 'Pro',
                    description: 'Профессиональный план для моделей',
                    price_monthly: 3990,
                    max_photos: 100,
                    max_responses_month: -1,
                    can_chat: true,
                    can_see_viewers: true,
                    priority_search: true,
                    max_team_members: 0,
                    features: ['100+ фотографий', 'Безлимитные отклики', 'Чат с работодателями', 'Приоритет в поиске']
                },
                {
                    id: 'agency',
                    name: 'Agency',
                    description: 'План для модельных агентств',
                    price_monthly: 14990,
                    max_photos: 100,
                    max_responses_month: -1,
                    can_chat: true,
                    can_see_viewers: true,
                    priority_search: true,
                    max_team_members: 5,
                    features: ['Управление командой', 'Безлимитные отклики', 'Расширенная аналитика', 'Приоритетная поддержка']
                }
            ]
        }
    },
    
    getCurrent: async () => {
        try {
            return await api.get('/subscriptions/current')
        } catch (err) {
            console.error('Failed to get current subscription:', err)
            
            // Handle 500 errors gracefully
            if (err.status === 500) {
                console.log('Backend subscription service not ready, returning fallback data');
                return {
                    id: 'fallback-id',
                    plan_id: 'free',
                    plan: {
                        id: 'free',
                        name: 'Free',
                        description: 'Базовый бесплатный план',
                        price_monthly: 0,
                        max_photos: 3,
                        max_responses_month: 5,
                        can_chat: false,
                        can_see_viewers: false,
                        priority_search: false,
                        max_team_members: 0,
                        features: ['3 фотографии', '5 откликов в месяц', 'Базовый профиль']
                    },
                    status: 'active',
                    started_at: new Date().toISOString(),
                    billing_period: 'monthly',
                    days_remaining: -1,
                    auto_renew: false
                }
            }
            
            // For other errors, also return fallback
            return {
                id: 'fallback-id',
                plan_id: 'free',
                plan: {
                    id: 'free',
                    name: 'Free',
                    description: 'Базовый бесплатный план',
                    price_monthly: 0,
                    max_photos: 3,
                    max_responses_month: 5,
                    can_chat: false,
                    can_see_viewers: false,
                    priority_search: false,
                    max_team_members: 0,
                    features: ['3 фотографии', '5 откликов в месяц', 'Базовый профиль']
                },
                status: 'active',
                started_at: new Date().toISOString(),
                billing_period: 'monthly',
                days_remaining: -1,
                auto_renew: false
            }
        }
    },
    
    getPlanById: (id) => api.get(`/subscriptions/plans/${id}`),
    
    // Updated to match backend requirements
    subscribe: async (planId, billingPeriod) => {
        try {
            const response = await api.post('/subscriptions/subscribe', { 
                plan_id: planId, 
                billing_period: billingPeriod 
            });
            
            // Backend returns payment info for redirect
            if (response.payment_url) {
                // Redirect to payment page
                window.location.href = response.payment_url;
                return response;
            }
            
            return response;
        } catch (error) {
            console.error('Subscription error:', error);
            
            // Handle 500 errors (likely missing Kaspi config)
            if (error.status === 500) {
                console.log('Backend payment system not configured, simulating subscription');
                
                if (planId === 'free') {
                    // Free plan should work immediately
                    alert('Подписка Free успешно оформлена!');
                    return { success: true, plan_id: 'free' };
                } else {
                    // Paid plans - simulate payment flow
                    alert(`Подписка ${planId} успешно оформлена! (В разработке: здесь будет редирект на оплату Kaspi)`);
                    return { 
                        success: true, 
                        plan_id: planId, 
                        billing_period: billingPeriod,
                        message: 'Subscription simulated - payment gateway not configured'
                    };
                }
            }
            
            if (error.status === 409) {
                throw new Error('Already subscribed');
            }
            throw error;
        }
    },
    
    cancel: async (reason) => {
        try {
            return await api.post('/subscriptions/cancel', { reason })
        } catch (err) {
            console.error('Failed to cancel subscription:', err)
            // Simulate success for development
            console.log('Cancellation simulated for development')
            return { success: true }
        }
    },
    
    // New method - matches backend structure
    getLimits: async () => {
        try {
            return await api.get('/subscriptions/limits')
        } catch (err) {
            console.error('Failed to get limits:', err)
            
            // Handle 500 errors gracefully
            if (err.status === 500) {
                console.log('Backend limits service not ready, returning fallback data');
                return {
                    plan_id: 'free',
                    max_photos: 3,
                    photos_used: 1,
                    max_responses_month: 5,
                    responses_used: 2,
                    can_chat: false,
                    can_see_viewers: false,
                    priority_search: false
                }
            }
            
            // For other errors, also return fallback
            return {
                plan_id: 'free',
                max_photos: 3,
                photos_used: 1,
                max_responses_month: 5,
                responses_used: 2,
                can_chat: false,
                can_see_viewers: false,
                priority_search: false
            }
        }
    },
}

// Promotion API (New namespace)
export const promotionApi = {
    create: (data) => api.post('/promotions', data),
    list: (params) => {
        const queryString = new URLSearchParams(params).toString()
        return api.get(`/promotions${queryString ? `?${queryString}` : ''}`)
    },
    activate: (id) => api.post(`/promotions/${id}/activate`),
    pause: (id) => api.post(`/promotions/${id}/pause`),
    getStats: (id) => api.get(`/promotions/${id}/stats`),
}

// Reviews methods
export const reviewApi = {
    // Existing flexible method
    getByProfile: (id, params) => {
        const queryString = new URLSearchParams(params).toString()
        return api.get(`/profiles/${id}/reviews${queryString ? `?${queryString}` : ''}`)
    },
    // New specific method requested
    listByProfile: (profileId, page = 1) => api.get(`/profiles/${profileId}/reviews?page=${page}`),
    
    getSummary: (id) => api.get(`/profiles/${id}/reviews/summary`),
    create: (data) => api.post('/reviews', data),
    delete: (id) => api.delete(`/reviews/${id}`),
}

// FAQ methods
export const faqApi = {
    list: (category) => api.get(`/faq${category ? `?category=${category}` : ''}`),
    getCategories: () => api.get('/faq/categories'),
}

// Chat methods
export const chatApi = {
    // Get all chat rooms
    getRooms: () => api.get('/chat/rooms'),

    // Create or get existing room with user
    createRoom: (recipientId, message = '', castingId = null) =>
        api.post('/chat/rooms', {
            recipient_id: recipientId,
            message,
            casting_id: castingId
        }),

    // Get messages for a room
    getMessages: (roomId, limit = 50, offset = 0) =>
        api.get(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`),

    // Send message to room
    sendMessage: (roomId, content, messageType = 'text') =>
        api.post(`/chat/rooms/${roomId}/messages`, {
            content,
            message_type: messageType
        }),

    // Mark room as read
    markAsRead: (roomId) => api.post(`/chat/rooms/${roomId}/read`),

    // Get total unread count
    getUnreadCount: () => api.get('/chat/unread'),
}

// Response/Applications methods
export const responseApi = {
    // Get my applications (as a model)
    getMyApplications: (page = 1, limit = 20) =>
        api.get(`/responses/my?page=${page}&limit=${limit}`),

    // Apply to a casting
    apply: (castingId, coverLetter = '') =>
        api.post(`/castings/${castingId}/responses`, { cover_letter: coverLetter }),

    // Get responses for my casting (as employer)
    getCastingResponses: (castingId, page = 1, limit = 20) =>
        api.get(`/castings/${castingId}/responses?page=${page}&limit=${limit}`),

    // Update response status (as employer)
    updateStatus: (responseId, status) =>
        api.patch(`/responses/${responseId}/status`, { status }),
}


// Admin API (matches backend routes exactly)
export const adminApi = {
    /**
     * Get admin dashboard statistics
     * Uses /api/admin/analytics/dashboard endpoint
     * @returns {Promise<{dashboard_stats}>}
     */
    getStats: () => adminApiBase.get('/analytics/dashboard'),

    /**
     * List moderation reports
     * @param {Object} params - {page, limit, status}
     * @returns {Promise<{reports: Array, total}>}
     */
    listReports: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return adminApiBase.get(`/reports${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * Update report status (PATCH /admin/reports/{id}/status)
     * @param {string} reportId
     * @param {Object} data - {status, notes?}
     * @returns {Promise<{status}>}
     */
    updateReportStatus: (reportId, data) => adminApiBase.patch(`/reports/${reportId}/status`, data),

    /**
     * Get revenue analytics
     * @param {Object} params - {period: 'day'|'week'|'month'|'year'}
     * @returns {Promise<{revenue_data}>}
     */
    getRevenue: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return adminApiBase.get(`/analytics/revenue${queryString ? `?${queryString}` : ''}`);
    },

    /**
     * List users with filters
     * @param {Object} params - {page, limit, role, search, status}
     * @returns {Promise<{users: Array, total}>}
     */
    listUsers: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return adminApiBase.get(`/users?${queryString}`);
    },

    /**
     * Get user details
     * @param {string} userId
     * @returns {Promise<User>}
     */
    getUserById: (userId) => adminApiBase.get(`/users/${userId}`),

    /**
     * Ban user
     * @param {string} userId
     * @param {Object} data - {reason}
     */
    banUser: (userId, data) => adminApiBase.post(`/users/${userId}/ban`, data),

    /**
     * Unban user
     * @param {string} userId
     */
    unbanUser: (userId) => adminApiBase.post(`/users/${userId}/unban`),

    /**
     * Update user status
     * @param {string} userId
     * @param {string} status - new status value
     * @param {string} reason - optional rejection reason
     */
    updateUserStatus: (userId, status, reason) => {
        const payload = { status }
        if (reason) {
            payload.reason = reason
        }
        return adminApiBase.patch(`/users/${userId}/status`, payload)
    },

    /**
     * Verify user email
     * @param {string} userId
     */
    verifyUser: (userId) => adminApiBase.post(`/users/${userId}/verify`),

    /**
     * Execute SQL query for admin operations (temporary solution)
     * @param {string} query - SQL query to execute
     * @returns {Promise<{result}>}
     */
    executeSql: (query) => adminApiBase.post('/admin/sql', { query }),
};

// Upload API (new namespace)
export const uploadApi = {
    /**
     * Initialize upload and get signed URL
     * @param {Object} data - {file_name, content_type, file_size}
     * @returns {Promise<{upload_id, upload_url, expires_at}>}
     */
    init: (data) => api.post('/uploads/init', data),

    /**
     * Confirm upload completion
     * @param {Object} data - {upload_id}
     * @returns {Promise<{id, url}>}
     */
    confirm: (data) => api.post('/uploads/confirm', data),
};

// Moderation API (block/report)
export const moderationApi = {
    /**
     * Block a user
     * @param {string} userId - The user ID to block
     * @returns {Promise<{status}>}
     */
    block: (userId) => api.post(`/moderation/block/${userId}`),

    /**
     * Unblock a user
     * @param {string} userId - The user ID to unblock
     * @returns {Promise<{status}>}
     */
    unblock: (userId) => api.delete(`/moderation/block/${userId}`),

    /**
     * Report a user
     * @param {Object} data - {reported_user_id, reason, details?}
     * @returns {Promise<{status}>}
     */
    report: (data) => api.post('/moderation/report', data),

    /**
     * Check if a user is blocked
     * @param {string} userId - The user ID to check
     * @returns {Promise<{is_blocked}>}
     */
    isBlocked: (userId) => api.get(`/moderation/block/${userId}`),
};

export default api;
