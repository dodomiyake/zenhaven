// Utility function to get the API base URL
export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

// Utility function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    };

    const response = await fetch(url, defaultOptions);
    return response;
}; 