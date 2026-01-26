import { Link } from 'react-router-dom'
import './Pages.css'

export default function Advertising() {
    return (
        <div className="placeholder-page">
            <div className="placeholder-icon">📢</div>
            <h1>Реклама</h1>
            <p>Раздел в разработке</p>
            <p className="placeholder-sub">Скоро здесь будут доступны рекламные возможности</p>
            <Link to="/dashboard" className="btn btn-primary">Вернуться на главную</Link>
        </div>
    )
}
