import React, { useEffect, useState } from 'react';
import {
    fetchAllCountries,
    addCountry,
    deleteCountry,
    updateCountry,
    lookupCountry
} from '../api/countryApi';
import './Countries.css';

const Countries = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddCountryModalOpen, setIsAddCountryModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [currentCountry, setCurrentCountry] = useState({
        code: '',
        name: '',
        phoneCode: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        const loadCountries = async () => {
            try {
                const data = await fetchAllCountries();
                setCountries(data);
            } catch (error) {
                setError(error.message);
                setIsErrorModalOpen(true);
            } finally {
                setLoading(false);
            }
        };
        loadCountries();
    }, []);

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            const data = await fetchAllCountries();
            setCountries(data);
            return;
        }

        try {
            const country = await lookupCountry(searchValue);
            setCountries(country ? [country] : []);
        } catch (error) {
            setError(error.message);
            setIsErrorModalOpen(true);
        }
    };

    const handleEditClick = (country) => {
        setCurrentCountry(country);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (code) => {
        if (window.confirm('Вы уверены, что хотите удалить эту страну?')) {
            try {
                await deleteCountry(code);
                setCountries(countries.filter(country => country.code !== code));
                alert('Страна успешно удалена');
            } catch (error) {
                setError(error.message);
                setIsErrorModalOpen(true);
            }
        }
    };

    const handleCloseModals = () => {
        setIsAddCountryModalOpen(false);
        setIsEditModalOpen(false);
        setCurrentCountry({ code: '', name: '', phoneCode: '' });
        setValidationErrors({});
    };

    const validateCountry = (country) => {
        const errors = {};
        if (!country.code.trim()) {
            errors.code = "Код страны не должен быть пустым";
        } else if (country.code.length > 5) {
            errors.code = "Код страны слишком длинный";
        }
        if (!country.name.trim()) {
            errors.name = "Название страны не должно быть пустым";
        } else if (country.name.length > 50) {
            errors.name = "Название страны слишком длинное";
        }
        if (!country.phoneCode.trim()) {
            errors.phoneCode = "Телефонный код не должен быть пустым";
        }
        return errors;
    };

    const handleAddCountry = async (e) => {
        e.preventDefault();
        const errors = validateCountry(currentCountry);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        try {
            await addCountry(currentCountry);
            const updatedCountries = await fetchAllCountries();
            setCountries(updatedCountries);
            handleCloseModals();
        } catch (error) {
            setError(error.message);
            setIsErrorModalOpen(true);
        }
    };

    const handleUpdateCountry = async (e) => {
        e.preventDefault();
        const errors = validateCountry(currentCountry);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        try {
            await updateCountry(currentCountry.code, currentCountry);
            const updatedCountries = await fetchAllCountries();
            setCountries(updatedCountries);
            handleCloseModals();
        } catch (error) {
            setError(error.message);
            setIsErrorModalOpen(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCountry(prev => ({ ...prev, [name]: value }));
        setValidationErrors(prev => ({ ...prev, [name]: null }));
    };

    const closeErrorModal = () => {
        setIsErrorModalOpen(false);
        setError(null);
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="app-container">
            <div className="country-panel">
                <div className="country-header">
                    <h1>Список стран</h1>
                    <button
                        className="add-country-button"
                        onClick={() => {
                            setCurrentCountry({ code: '', name: '', phoneCode: '' });
                            setIsAddCountryModalOpen(true);
                        }}
                    >
                        Добавить страну
                    </button>
                </div>

                <div className="search-container" style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Поиск по коду, названию или телефонному коду"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            width: '300px',
                            marginRight: '10px'
                        }}
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
                            <th>№</th>
                            <th>Код</th>
                            <th>Название</th>
                            <th>Телефонный код</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {countries.length > 0 ? (
                            countries.map((country, index) => (
                                <tr key={country.code}>
                                    <td>{index + 1}</td>
                                    <td>{country.code}</td>
                                    <td>{country.name}</td>
                                    <td>{country.phoneCode}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleEditClick(country)}
                                                className="icon-button"
                                                title="Редактировать"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" className="icon-svg">
                                                    <path
                                                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(country.code)}
                                                className="icon-button delete-button"
                                                title="Удалить"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" className="icon-svg">
                                                    <path d="M3 6h18"/>
                                                    <path
                                                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                    Нет стран для отображения
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddCountryModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModals}>&times;</span>
                        <h2>Добавить страну</h2>
                        <form onSubmit={handleAddCountry}>
                            <input
                                type="text"
                                name="code"
                                placeholder="Код страны (например, RU)"
                                value={currentCountry.code}
                                onChange={handleInputChange}
                                required
                            />
                            {validationErrors.code && <p className="error">{validationErrors.code}</p>}

                            <input
                                type="text"
                                name="name"
                                placeholder="Название страны"
                                value={currentCountry.name}
                                onChange={handleInputChange}
                                required
                            />
                            {validationErrors.name && <p className="error">{validationErrors.name}</p>}

                            <input
                                type="text"
                                name="phoneCode"
                                placeholder="Телефонный код (например, +7)"
                                value={currentCountry.phoneCode}
                                onChange={handleInputChange}
                                required
                            />
                            {validationErrors.phoneCode && <p className="error">{validationErrors.phoneCode}</p>}

                            <button type="submit" className="add-country-button">Добавить</button>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModals}>&times;</span>
                        <h2>Редактировать страну</h2>
                        <form onSubmit={handleUpdateCountry}>
                            <input
                                type="text"
                                name="code"
                                placeholder="Код страны"
                                value={currentCountry.code}
                                onChange={handleInputChange}
                                required
                                disabled
                            />
                            {validationErrors.code && <p className="error">{validationErrors.code}</p>}

                            <input
                                type="text"
                                name="name"
                                placeholder="Название страны"
                                value={currentCountry.name}
                                onChange={handleInputChange}
                                required
                            />
                            {validationErrors.name && <p className="error">{validationErrors.name}</p>}

                            <input
                                type="text"
                                name="phoneCode"
                                placeholder="Телефонный код"
                                value={currentCountry.phoneCode}
                                onChange={handleInputChange}
                                required
                            />
                            {validationErrors.phoneCode && <p className="error">{validationErrors.phoneCode}</p>}

                            <button type="submit" className="add-country-button">Сохранить</button>
                        </form>
                    </div>
                </div>
            )}

            {isErrorModalOpen && (
                <div className="modal error-modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeErrorModal}>&times;</span>
                        <h2>Ошибка</h2>
                        <p>{error}</p>
                        <button className="error-button" onClick={closeErrorModal}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Countries;