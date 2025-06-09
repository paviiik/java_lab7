import React, { useEffect, useState } from 'react';
import {
    fetchAllCountries,
    addCountry,
    deleteCountry,
    updateCountry,
    lookupCountry
} from '../api/countryApi';
import './Countries.css';

const TEXT = {
    listTitle: "Список стран",
    addCountry: "Добавить страну",
    editCountry: "Редактировать страну",
    deleteConfirm: "Вы уверены, что хотите удалить эту страну?",
    deleteSuccess: "Страна успешно удалена",
    searchPlaceholder: "Поиск по коду, названию или телефонному коду",
    search: "Поиск",
    noCountries: "Нет стран для отображения",
    loading: "Загрузка...",
    errorTitle: "Ошибка",
    close: "Закрыть",
    save: "Сохранить",
    validation: {
        emptyCode: "Код страны не должен быть пустым",
        longCode: "Код страны слишком длинный",
        emptyName: "Название страны не должно быть пустым",
        longName: "Название страны слишком длинное",
        emptyPhoneCode: "Телефонный код не должен быть пустым"
    },
    placeholders: {
        code: "Код страны (например, RU)",
        name: "Название страны",
        phoneCode: "Телефонный код (например, +7)"
    },
    actions: {
        edit: "Редактировать",
        delete: "Удалить"
    }
};

const Countries = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddCountryModalOpen, setIsAddCountryModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [currentCountry, setCurrentCountry] = useState({ code: '', name: '', phoneCode: '' });
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
        if (window.confirm(TEXT.deleteConfirm)) {
            try {
                await deleteCountry(code);
                setCountries(countries.filter(country => country.code !== code));
                alert(TEXT.deleteSuccess);
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
            errors.code = TEXT.validation.emptyCode;
        } else if (country.code.length > 5) {
            errors.code = TEXT.validation.longCode;
        }
        if (!country.name.trim()) {
            errors.name = TEXT.validation.emptyName;
        } else if (country.name.length > 50) {
            errors.name = TEXT.validation.longName;
        }
        if (!country.phoneCode.trim()) {
            errors.phoneCode = TEXT.validation.emptyPhoneCode;
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

    if (loading) return <div className="loading">{TEXT.loading}</div>;

    return (
        <div className="app-container">
            <div className="country-panel">
                <div className="country-header">
                    <h1>{TEXT.listTitle}</h1>
                    <button className="add-country-button" onClick={() => {
                        setCurrentCountry({ code: '', name: '', phoneCode: '' });
                        setIsAddCountryModalOpen(true);
                    }}>{TEXT.addCountry}</button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder={TEXT.searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="search-input"
                    />
                    <button
                        className="add-country-button search-button"
                        onClick={handleSearch}
                    >
                        {TEXT.search}
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
                                                title={TEXT.actions.edit}
                                            >
                                                <img src="/icons/edit.svg" alt={TEXT.actions.edit} className="icon-svg" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(country.code)}
                                                className="icon-button delete-button"
                                                title={TEXT.actions.delete}
                                            >
                                                <img src="/icons/delete.svg" alt={TEXT.actions.delete} className="icon-svg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="center-text">
                                    {TEXT.noCountries}
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
                        <h2>{TEXT.addCountry}</h2>
                        <form onSubmit={handleAddCountry}>
                            <input type="text" name="code" placeholder={TEXT.placeholders.code} value={currentCountry.code} onChange={handleInputChange} required />
                            {validationErrors.code && <p className="error">{validationErrors.code}</p>}

                            <input type="text" name="name" placeholder={TEXT.placeholders.name} value={currentCountry.name} onChange={handleInputChange} required />
                            {validationErrors.name && <p className="error">{validationErrors.name}</p>}

                            <input type="text" name="phoneCode" placeholder={TEXT.placeholders.phoneCode} value={currentCountry.phoneCode} onChange={handleInputChange} required />
                            {validationErrors.phoneCode && <p className="error">{validationErrors.phoneCode}</p>}

                            <button type="submit" className="add-country-button">{TEXT.addCountry}</button>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModals}>&times;</span>
                        <h2>{TEXT.editCountry}</h2>
                        <form onSubmit={handleUpdateCountry}>
                            <input type="text" name="code" placeholder={TEXT.placeholders.code} value={currentCountry.code} onChange={handleInputChange} required disabled />
                            {validationErrors.code && <p className="error">{validationErrors.code}</p>}

                            <input type="text" name="name" placeholder={TEXT.placeholders.name} value={currentCountry.name} onChange={handleInputChange} required />
                            {validationErrors.name && <p className="error">{validationErrors.name}</p>}

                            <input type="text" name="phoneCode" placeholder={TEXT.placeholders.phoneCode} value={currentCountry.phoneCode} onChange={handleInputChange} required />
                            {validationErrors.phoneCode && <p className="error">{validationErrors.phoneCode}</p>}

                            <button type="submit" className="add-country-button">{TEXT.save}</button>
                        </form>
                    </div>
                </div>
            )}

            {isErrorModalOpen && (
                <div className="modal error-modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeErrorModal}>&times;</span>
                        <h2>{TEXT.errorTitle}</h2>
                        <p>{error}</p>
                        <button className="error-button" onClick={closeErrorModal}>{TEXT.close}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Countries;
