import React from 'react';
import PropTypes from 'prop-types';
import './RoleSelector.css';

/**
 * RoleSelector - Three-card role selection UI
 * @param {Object} props
 * @param {Function} props.onRoleSelect - Callback with selected role
 */
export default function RoleSelector({ onRoleSelect }) {
    const roles = [
        {
            id: 'model',
            icon: (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            ),
            title: 'Я модель',
            description: 'Создайте профессиональное портфолио и начните получать предложения от ведущих агентств и брендов',
            features: [
                'Создание впечатляющего портфолио',
                'Доступ к эксклюзивным кастингам',
                'Прямое общение с работодателями',
                'Управление карьерой и графиком'
            ]
        },
        {
            id: 'employer',
            icon: (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                </svg>
            ),
            title: 'Я работодатель',
            description: 'Находите идеальных моделей для ваших проектов и управляйте всем процессом кастингов',
            features: [
                'Создание и управление кастингами',
                'Поиск моделей по параметрам',
                'Аналитика и отчеты',
                'Коммуникация с моделями'
            ]
        },
        {
            id: 'agency',
            icon: (
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
            ),
            title: 'Я агентство',
            description: 'Управляйте портфолио моделей агентства и организуйте кастинги для ваших клиентов',
            features: [
                'Управление моделями агентства',
                'Организация кастингов и проектов',
                'База данных профессионалов',
                'Полный контроль над процессами'
            ]
        }
    ];

    const handleRoleClick = (role) => {
        onRoleSelect(role);
    };

    return (
        <div className="role-selector">
            {roles.map((role) => (
                <div
                    key={role.id}
                    className="role-card"
                    onClick={() => handleRoleClick(role.id)}
                >
                    <div className="role-icon">{role.icon}</div>
                    <h3 className="role-title">{role.title}</h3>
                    <p className="role-description">{role.description}</p>
                    <ul className="role-features">
                        {role.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                    <button className="role-select-btn">Выбрать</button>
                </div>
            ))}
        </div>
    );
}

RoleSelector.propTypes = {
    onRoleSelect: PropTypes.func.isRequired,
};
