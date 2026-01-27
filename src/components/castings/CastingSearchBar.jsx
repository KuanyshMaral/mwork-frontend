import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CastingSearchBar.css';

/**
 * CastingSearchBar - Keyword search input
 * @param {Object} props
 * @param {Function} props.onSearch - Callback with search query
 */
export default function CastingSearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        // Validation: Disable/Block if query.length < 2
        if (query.length >= 2) {
            onSearch(query);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="casting-search-bar">
            <div className="search-input-wrapper">
                {/* Search Icon (Absolute Left) */}
                <svg 
                    className="search-icon" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                
                <input
                    type="text"
                    className="search-input"
                    placeholder="Поиск кастингов..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <button
                className="search-button"
                onClick={handleSearch}
                disabled={query.length < 2}
                aria-label="Найти"
            >
                <span className="btn-text-desktop">Найти</span>
                <span className="btn-icon-mobile">🔍</span>
            </button>
        </div>
    );
}

CastingSearchBar.propTypes = {
    onSearch: PropTypes.func.isRequired,
};