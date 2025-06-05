import React, { useEffect, useState } from 'react';
import {
    fetchAllPrefixes,
    createPrefix,
    updatePrefix,
    deletePrefix,
    fetchPrefixesByCountry,
    fetchPrefixesByCountryName
} from '../api/prefixApi';
import { fetchAllCountries } from '../api/countryApi';
import './PhonePrefixes.css';

const PhonePrefixes = () => {
    const [prefixes, setPrefixes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPrefix, setCurrentPrefix] = useState({
        id: null,
        prefix: '',
        countryCode: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prefixesData, countriesData] = await Promise.all([
                    fetchAllPrefixes(),
                    fetchAllCountries()
                ]);
                setPrefixes(prefixesData);
                setCountries(countriesData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const validatePrefix = (prefix) => {
        const errors = {};
        if (!prefix.prefix.trim()) {
            errors.prefix = "Префикс не должен быть пустым";
        }
        if (!prefix.countryCode) {
            errors.countryCode = "Необходимо выбрать страну";
        }
        return errors;
    };

    const handleSearch = async () => {
        try {
            let data;
            if (searchType === 'countryCode') {
                data = await fetchPrefixesByCountry(searchTerm);
            } else if (searchType === 'countryName') {
                data = await fetchPrefixesByCountryName(searchTerm);
            } else {
                data = await fetchAllPrefixes();
            }
            setPrefixes(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAddPrefix = async (e) => {
        e.preventDefault();
        const errors = validatePrefix(currentPrefix);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const createdPrefix = await createPrefix(currentPrefix);
            setPrefixes([...prefixes, createdPrefix]);
            setIsAddModalOpen(false);
            setCurrentPrefix({ id: null, prefix: '', countryCode: '' });
            setValidationErrors({});
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUpdatePrefix = async (e) => {
        e.preventDefault();
        const errors = validatePrefix(currentPrefix);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            const updatedPrefix = await updatePrefix(currentPrefix.id, currentPrefix);
            setPrefixes(prefixes.map(p => p.id === updatedPrefix.id ? updatedPrefix : p));
            setIsEditModalOpen(false);
            setCurrentPrefix({ id: null, prefix: '', countryCode: '' });
            setValidationErrors({});
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeletePrefix = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот префикс?')) {
            try {
                await deletePrefix(id);
                setPrefixes(prefixes.filter(p => p.id !== id));
            } catch (error) {
                setError(error.message);
            }
        }
    };

    const getCountryName = (countryCode) => {
        const country = countries.find(c => c.code === countryCode);
        return country ? country.name : 'Неизвестно';
    };

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setCurrentPrefix({ id: null, prefix: '', countryCode: '' });
        setValidationErrors({});
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="app-container">
            <div className="prefix-panel">
                <div className="prefix-header">
                    <h1>Телефонные префиксы</h1>
                    <button
                        className="add-country-button"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Добавить префикс
                    </button>
                </div>

                <div className="search-container">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="search-select"
                    >
                        <option value="all">Все префиксы</option>
                        <option value="countryCode">По коду страны</option>
                        <option value="countryName">По названию страны</option>
                    </select>
                    <input
                        type="text"
                        placeholder={
                            searchType === 'countryCode' ? 'Введите код страны' :
                                searchType === 'countryName' ? 'Введите название страны' : ''
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={searchType === 'all'}
                        className="search-input"
                    />
                    <button
                        className="add-country-button"
                        onClick={handleSearch}
                        style={{ padding: '10px 20px' }}
                    >
                        Поиск
                    </button>
                </div>

                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Префикс</th>
                            <th>Страна</th>
                            <th>Код страны</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {prefixes.map(prefix => (
                            <tr key={prefix.id}>
                                <td>{prefix.id}</td>
                                <td>{prefix.prefix}</td>
                                <td>{getCountryName(prefix.countryCode)}</td>
                                <td>{prefix.countryCode}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => {
                                                setCurrentPrefix(prefix);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="icon-button"
                                            title="Редактировать"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24"
                                                 fill="none" stroke="currentColor" className="icon-svg">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeletePrefix(prefix.id)}
                                            className="icon-button delete-button"
                                            title="Удалить"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24"
                                                 fill="none" stroke="currentColor" className="icon-svg">
                                                <path d="M3 6h18"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModals}>&times;</span>
                        <h2>Добавить телефонный префикс</h2>
                        <form onSubmit={handleAddPrefix}>
                            <input
                                type="text"
                                name="prefix"
                                placeholder="Префикс (например, +7)"
                                value={currentPrefix.prefix}
                                onChange={(e) => {
                                    setCurrentPrefix({...currentPrefix, prefix: e.target.value});
                                    setValidationErrors({...validationErrors, prefix: null});
                                }}
                                required
                            />
                            {validationErrors.prefix && <p className="error">{validationErrors.prefix}</p>}

                            <select
                                name="countryCode"
                                value={currentPrefix.countryCode}
                                onChange={(e) => {
                                    setCurrentPrefix({...currentPrefix, countryCode: e.target.value});
                                    setValidationErrors({...validationErrors, countryCode: null});
                                }}
                                required
                            >
                                <option value="">Выберите страну</option>
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name} ({country.code})
                                    </option>
                                ))}
                            </select>
                            {validationErrors.countryCode && <p className="error">{validationErrors.countryCode}</p>}

                            <button type="submit" className="add-country-button">Добавить</button>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModals}>&times;</span>
                        <h2>Редактировать телефонный префикс</h2>
                        <form onSubmit={handleUpdatePrefix}>
                            <input
                                type="text"
                                name="prefix"
                                placeholder="Префикс"
                                value={currentPrefix.prefix}
                                onChange={(e) => {
                                    setCurrentPrefix({...currentPrefix, prefix: e.target.value});
                                    setValidationErrors({...validationErrors, prefix: null});
                                }}
                                required
                            />
                            {validationErrors.prefix && <p className="error">{validationErrors.prefix}</p>}

                            <select
                                name="countryCode"
                                value={currentPrefix.countryCode}
                                onChange={(e) => {
                                    setCurrentPrefix({...currentPrefix, countryCode: e.target.value});
                                    setValidationErrors({...validationErrors, countryCode: null});
                                }}
                                required
                            >
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name} ({country.code})
                                    </option>
                                ))}
                            </select>
                            {validationErrors.countryCode && <p className="error">{validationErrors.countryCode}</p>}

                            <button type="submit" className="add-country-button">Сохранить</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhonePrefixes;