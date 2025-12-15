import { useState, useCallback } from 'react';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Hook personalizado para manejar interacciones con la API.
 * Proporciona estados de carga, error y la función para hacer peticiones.
 * @returns {{
 * data: any,
 * loading: boolean,
 * error: any,
 * fetchData: (endpoint: string, method: string, body?: object) => Promise<any>
 * }}
 */
export const useApi = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
	console.log(BASE_URL)
    /**
     * Función central para realizar peticiones HTTP.
     * @param {string} endpoint - La ruta específica de la API (ej: '/rutas').
     * @param {string} method - El método HTTP (ej: 'GET', 'POST', 'PUT', 'DELETE').
     * @param {object} [body=null] - El cuerpo de la petición para métodos como POST/PUT.
     */
    const fetchData = useCallback(async (endpoint, method = 'GET', body = null) => {
        setLoading(true);
        setError(null);
        setData(null);

        const url = `${BASE_URL}${endpoint}`;
        
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Error ${response.status}: El servidor respondió con un error.` };
                }
                throw new Error(errorData.message || `Fallo en la petición con estado: ${response.status}`);
            }

            if (response.status === 204) {
                setData(true); 
                return true;
            }

            const result = await response.json();
            setData(result);
            return result; 
        } catch (err) {
            console.error("API Fetch Error:", err);
            setError(err.message || "Ocurrió un error desconocido.");
            throw err; 
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, fetchData };
};
