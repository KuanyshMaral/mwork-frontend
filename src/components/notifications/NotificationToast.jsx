import { useNotifications } from '../../context/NotificationContext'
import './NotificationToast.css'

const NOTIFICATION_ICONS = {
    new_response: '📩',
    response_accepted: '🎉',
    response_rejected: '❌',
    new_message: '💬',
    profile_viewed: '👁️',
    casting_expiring: '⏰'
}

function NotificationToast() {
    const { toast, hideToast } = useNotifications()

    if (!toast) return null

    return (
        <div className="notification-toast" onClick={hideToast}>
            <div className="toast-icon">
                {NOTIFICATION_ICONS[toast.type] || '🔔'}
            </div>
            <div className="toast-content">
                <p className="toast-title">{toast.title}</p>
                {toast.body && (
                    <p className="toast-body">{toast.body}</p>
                )}
            </div>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); hideToast(); }}>
                ✕
            </button>
        </div>
    )
}

export default NotificationToast
