import { Link } from 'react-router-dom'
import './Pages.css'

export default function Photostudios() {
    return (
        <div className="placeholder-page">
            <div className="placeholder-icon">📷</div>
            <h1>Фотостудии</h1>
            <p>Раздел в разработке</p>
            <p className="placeholder-sub">Скоро здесь появится каталог фотостудий для аренды</p>
            <Link to="/dashboard" className="btn btn-primary">Вернуться на главную</Link>
        </div>
    )
}
