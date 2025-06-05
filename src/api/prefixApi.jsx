import axios from 'axios';

const PREFIX_API_URL = 'http://localhost:8080/prefixes';

export const fetchAllPrefixes = async () => {
    const response = await axios.get(PREFIX_API_URL);
    return response.data;
};

export const fetchPrefixById = async (id) => {
    const response = await axios.get(`${PREFIX_API_URL}/${id}`);
    return response.data;
};

export const createPrefix = async (prefixData) => {
    const response = await axios.post(`${PREFIX_API_URL}/save`, prefixData);
    return response.data;
};

export const updatePrefix = async (id, prefixData) => {
    const response = await axios.put(`${PREFIX_API_URL}/${id}`, prefixData);
    return response.data;
};

export const deletePrefix = async (id) => {
    await axios.delete(`${PREFIX_API_URL}/${id}`);
};

export const fetchPrefixesByCountry = async (countryCode) => {
    const response = await axios.get(`${PREFIX_API_URL}/country/${countryCode}`);
    return response.data;
};

export const fetchPrefixesByCountryName = async (countryName) => {
    const response = await axios.get(`${PREFIX_API_URL}/by-country-name`, {
        params: { name: countryName }
    });
    return response.data;
};