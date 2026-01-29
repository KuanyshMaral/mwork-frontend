import './ReadReceipt.css'

export default function ReadReceipt({ isRead, isOwn }) {
    if (!isOwn) return null

    return (
        <span className={`read-receipt ${isRead ? 'read' : 'sent'}`} title={isRead ? 'Прочитано' : 'Отправлено'}>
            {isRead ? '✓✓' : '✓'}
        </span>
    )
}
