import axios from 'axios';

const COUNTRY_API_URL = 'http://localhost:8080/countries';

export const fetchAllCountries = async () => {
    const response = await axios.get(COUNTRY_API_URL);
    return response.data;
};

export const getCountryByCode = async (code) => {
    const response = await axios.get(`${COUNTRY_API_URL}/${code}`);
    return response.data;
};

export const addCountry = async (country) => {
    const response = await axios.post(`${COUNTRY_API_URL}/save`, country);
    return response.data;
};

export const updateCountry = async (code, country) => {
    const response = await axios.put(`${COUNTRY_API_URL}/${code}`, country);
    return response.data;
};

export const deleteCountry = async (code) => {
    await axios.delete(`${COUNTRY_API_URL}/${code}`);
};

export const lookupCountry = async (value) => {
    const response = await axios.get(`${COUNTRY_API_URL}/lookup`, {
        params: { value }
    });
    return response.data;
};

export const bulkCreateCountries = async (countries) => {
    const response = await axios.post(`${COUNTRY_API_URL}/saveAll`, countries);
    return response.data;
};