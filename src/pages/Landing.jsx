import { Link } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-gradient"></div>
                </div>

                <nav className="landing-nav">
                    <div className="container flex-between">
                        <Link to="/" className="landing-logo">
                            <span className="logo-icon">M</span>
                            <span>MWork</span>
                        </Link>
                        <div className="nav-links">
                            <Link to="/login" className="btn btn-secondary">Войти</Link>
                            <Link to="/register" className="btn btn-primary">Начать</Link>
                        </div>
                    </div>
                </nav>

                <div className="hero-content container">
                    <h1 className="hero-title">
                        Найди работу
                        <span className="gradient-text"> своей мечты</span>
                    </h1>
                    <p className="hero-subtitle">
                        Платформа №1 в Казахстане для моделей и работодателей.
                        Тысячи вакансий каждый месяц.
                    </p>

                    <div className="role-cards">
                        <Link to="/register?role=model" className="role-card">
                            <div className="role-icon">👩‍🎤</div>
                            <h3>Я модель</h3>
                            <p>Найди кастинги, создай портфолио, получай заказы</p>
                            <span className="role-arrow">→</span>
                        </Link>

                        <Link to="/register?role=employer" className="role-card">
                            <div className="role-icon">💼</div>
                            <h3>Я работодатель</h3>
                            <p>Найди идеальных моделей для своего проекта</p>
                            <span className="role-arrow">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">5000+</span>
                            <span className="stat-label">Моделей</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">1200+</span>
                            <span className="stat-label">Кастингов</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">800+</span>
                            <span className="stat-label">Компаний</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">₸50M+</span>
                            <span className="stat-label">Заработано</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features-section">
                <div className="container">
                    <h2>Почему MWork?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h4>Точный поиск</h4>
                            <p>Умные фильтры помогут найти идеальные вакансии под ваши параметры</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h4>Безопасность</h4>
                            <p>Все работодатели проверены, защита персональных данных</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h4>Аналитика</h4>
                            <p>Отслеживайте просмотры профиля, статистику откликов</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h4>Чат</h4>
                            <p>Общайтесь с работодателями прямо на платформе</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Готовы начать?</h2>
                        <p>Присоединяйтесь к тысячам моделей, которые уже нашли работу</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Создать профиль бесплатно
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">M</span>
                            <span>MWork</span>
                        </div>
                        <p>© 2025 MWork. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
