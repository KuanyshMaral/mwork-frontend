import { Link } from 'react-router-dom'
import './TopSpenders.css'

export default function TopSpenders({ spenders = [] }) {
    const defaultSpenders = spenders.length > 0 ? spenders : [
        { id: '1', name: 'Fashion Studio KZ', email: 'fashion@example.com', total_spent: 450000, type: 'employer' },
        { id: '2', name: 'Glamour Agency', email: 'glamour@example.com', total_spent: 380000, type: 'agency' },
        { id: '3', name: 'Photo Pro', email: 'photo@example.com', total_spent: 290000, type: 'employer' },
        { id: '4', name: 'Model Management', email: 'mm@example.com', total_spent: 250000, type: 'agency' },
        { id: '5', name: 'Event Masters', email: 'events@example.com', total_spent: 180000, type: 'employer' }
    ]

    const maxSpent = Math.max(...defaultSpenders.map(s => s.total_spent || 0), 1)

    return (
        <div className="top-spenders">
            <h3>Топ клиентов по расходам</h3>

            <div className="spenders-list">
                {defaultSpenders.map((spender, index) => (
                    <div key={spender.id} className="spender-item">
                        <div className="spender-rank">#{index + 1}</div>
                        <div className="spender-avatar">
                            {spender.avatar_url ? (
                                <img src={spender.avatar_url} alt="" />
                            ) : (
                                <span>{spender.type === 'agency' ? '🏢' : '👔'}</span>
                            )}
                        </div>
                        <div className="spender-info">
                            <Link to={`/profile/${spender.id}`} className="spender-name">
                                {spender.name}
                            </Link>
                            <span className="spender-email">{spender.email}</span>
                        </div>
                        <div className="spender-amount">
                            <span className="amount">₸{spender.total_spent.toLocaleString()}</span>
                            <div className="amount-bar">
                                <div 
                                    className="amount-fill"
                                    style={{ width: `${(spender.total_spent / maxSpent) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="spenders-footer">
                <span className="total-label">
                    Всего от топ-5: 
                </span>
                <span className="total-value">
                    ₸{defaultSpenders.reduce((sum, s) => sum + (s.total_spent || 0), 0).toLocaleString()}
                </span>
            </div>
        </div>
    )
}
