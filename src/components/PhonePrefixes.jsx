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

const TEXT = {
    title: "Телефонные префиксы",
    add: "Добавить префикс",
    edit: "Редактировать телефонный префикс",
    deleteConfirm: "Вы уверены, что хотите удалить этот префикс?",
    unknownCountry: "Неизвестно",
    loading: "Загрузка...",
    error: "Ошибка:",
    search: {
        all: "Все префиксы",
        byCode: "По коду страны",
        byName: "По названию страны",
        placeholderByCode: "Введите код страны",
        placeholderByName: "Введите название страны"
    },
    validation: {
        emptyPrefix: "Префикс не должен быть пустым",
        emptyCountry: "Необходимо выбрать страну"
    },
    placeholders: {
        prefix: "Префикс (например, +7)",
        prefixSimple: "Префикс"
    },
    actions: {
        save: "Сохранить",
        selectCountry: "Выберите страну"
    },
    table: {
        id: "ID",
        prefix: "Префикс",
        country: "Страна",
        countryCode: "Код страны",
        actions: "Действия"
    },
    modal: {
        close: "×"
    }
};

const PhonePrefixes = () => {
    const [prefixes, setPrefixes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPrefix, setCurrentPrefix] = useState({ id: null, prefix: '', countryCode: '' });
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
            errors.prefix = TEXT.validation.emptyPrefix;
        }
        if (!prefix.countryCode) {
            errors.countryCode = TEXT.validation.emptyCountry;
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
        if (window.confirm(TEXT.deleteConfirm)) {
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
        return country ? country.name : TEXT.unknownCountry;
    };

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setCurrentPrefix({ id: null, prefix: '', countryCode: '' });
        setValidationErrors({});
    };

    if (loading) return <div className="loading">{TEXT.loading}</div>;
    if (error) return <div className="error">{TEXT.error} {error}</div>;

    return (
        <div className="app-container">
            <div className="prefix-panel">
                <div className="prefix-header">
                    <h1>{TEXT.title}</h1>
                    <button className="add-country-button" onClick={() => setIsAddModalOpen(true)}>
                        {TEXT.add}
                    </button>
                </div>

                <div className="search-container">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="search-select"
                    >
                        <option value="all">{TEXT.search.all}</option>
                        <option value="countryCode">{TEXT.search.byCode}</option>
                        <option value="countryName">{TEXT.search.byName}</option>
                    </select>
                    <input
                        type="text"
                        placeholder={
                            searchType === 'countryCode'
                                ? TEXT.search.placeholderByCode
                                : searchType === 'countryName'
                                    ? TEXT.search.placeholderByName
                                    : ''
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={searchType === 'all'}
                        className="search-input"
                    />
                    <button className="add-country-button search-button" onClick={handleSearch}>
                        Поиск
                    </button>
                </div>

                <div className="table-container">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>{TEXT.table.id}</th>
                            <th>{TEXT.table.prefix}</th>
                            <th>{TEXT.table.country}</th>
                            <th>{TEXT.table.countryCode}</th>
                            <th>{TEXT.table.actions}</th>
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
                                            <img src="/icons/edit.svg" alt="Редактировать" className="icon-svg" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePrefix(prefix.id)}
                                            className="icon-button delete-button"
                                            title="Удалить"
                                        >
                                            <img src="/icons/delete.svg" alt="Удалить" className="icon-svg" />
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
                        <span className="close" onClick={handleCloseModals}>{TEXT.modal.close}</span>
                        <h2>{TEXT.add}</h2>
                        <form onSubmit={handleAddPrefix}>
                            <input
                                type="text"
                                name="prefix"
                                placeholder={TEXT.placeholders.prefix}
                                value={currentPrefix.prefix}
                                onChange={(e) => {
                                    setCurrentPrefix({ ...currentPrefix, prefix: e.target.value });
                                    setValidationErrors({ ...validationErrors, prefix: null });
                                }}
                                required
                            />
                            {validationErrors.prefix && <p className="error">{validationErrors.prefix}</p>}

                            <select
                                name="countryCode"
                                value={currentPrefix.countryCode}
                                onChange={(e) => {
                                    setCurrentPrefix({ ...currentPrefix, countryCode: e.target.value });
                                    setValidationErrors({ ...validationErrors, countryCode: null });
                                }}
                                required
                            >
                                <option value="">{TEXT.actions.selectCountry}</option>
                                {countries.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name} ({country.code})
                                    </option>
                                ))}
                            </select>
                            {validationErrors.countryCode && <p className="error">{validationErrors.countryCode}</p>}

                            <button type="submit" className="add-country-button">{TEXT.add}</button>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModals}>{TEXT.modal.close}</span>
                        <h2>{TEXT.edit}</h2>
                        <form onSubmit={handleUpdatePrefix}>
                            <input
                                type="text"
                                name="prefix"
                                placeholder={TEXT.placeholders.prefixSimple}
                                value={currentPrefix.prefix}
                                onChange={(e) => {
                                    setCurrentPrefix({ ...currentPrefix, prefix: e.target.value });
                                    setValidationErrors({ ...validationErrors, prefix: null });
                                }}
                                required
                            />
                            {validationErrors.prefix && <p className="error">{validationErrors.prefix}</p>}

                            <select
                                name="countryCode"
                                value={currentPrefix.countryCode}
                                onChange={(e) => {
                                    setCurrentPrefix({ ...currentPrefix, countryCode: e.target.value });
                                    setValidationErrors({ ...validationErrors, countryCode: null });
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

                            <button type="submit" className="add-country-button">{TEXT.actions.save}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhonePrefixes;
