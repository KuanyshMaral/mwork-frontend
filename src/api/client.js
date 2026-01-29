// API Client - lightweight fetch wrapper

const API_BASE = '/api/v1'

class ApiError extends Error {
    constructor(message, status, data) {
        super(message)
        this.status = status
        this.data = data
    }
}

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token')

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    }

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body)
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config)

    // Handle 204 No Content
    if (response.status === 204) {
        return null
    }

    const data = await response.json()

    if (!response.ok) {
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

// Auth-specific methods
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: (data) => api.post('/auth/logout', data),
    refresh: (data) => api.post('/auth/refresh', data),
    me: () => api.get('/auth/me'),
}

// Profile methods
export const profileApi = {
    getMe: () => api.get('/profiles/me'),
    getById: (id) => api.get(`/profiles/${id}`),
    update: (id, data) => api.put(`/profiles/${id}`, data),
    getCompleteness: (id) => api.get(`/profiles/${id}/completeness`),
    getSocialLinks: (id) => api.get(`/profiles/${id}/social-links`),
    addSocialLink: (id, data) => api.post(`/profiles/${id}/social-links`, data),
    deleteSocialLink: (id, platform) => api.delete(`/profiles/${id}/social-links/${platform}`),
    createModel: (data) => api.post('/profiles/models', data),
    createEmployer: (data) => api.post('/profiles/employers', data),
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
}

// Subscription methods
export const subscriptionApi = {
    getPlans: () => api.get('/subscriptions/plans'),
    getCurrent: () => api.get('/subscriptions/current'),
    getPlanById: (id) => api.get(`/subscriptions/plans/${id}`),
    
    // Updated to match new requirements
    subscribe: async (planId, billingPeriod) => {
        try {
            return await api.post('/subscriptions/subscribe', { 
                plan_id: planId, 
                billing_period: billingPeriod 
            });
        } catch (error) {
            if (error.status === 409) {
                throw new Error('Already subscribed');
            }
            throw error;
        }
    },
    
    cancel: (reason) => api.post('/subscriptions/cancel', { reason }),
    
    // New method
    getLimits: () => api.get('/subscriptions/limits'),
}

// Promotion API (New namespace)
export const promotionApi = {
    create: (data) => api.post('/promotions', data),
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


// Admin API (new namespace)
export const adminApi = {
    /**
     * Get admin dashboard statistics
     * @returns {Promise<{total_users, total_castings, active_subscriptions, pending_payments, pending_reports}>}
     */
    getStats: () => api.get('/admin/stats'),

    /**
     * List moderation reports
     * @param {Object} params - {page, limit, status}
     * @returns {Promise<{reports: Array, total}>}
     */
    listReports: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/reports?${queryString}`);
    },

    /**
     * Resolve moderation report
     * @param {string} reportId
     * @param {Object} data - {action: 'warn'|'suspend'|'delete'|'dismiss', notes}
     * @returns {Promise<{status}>}
     */
    resolveReport: (reportId, data) => api.post(`/admin/reports/${reportId}/resolve`, data),
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
