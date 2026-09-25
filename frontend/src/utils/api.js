const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = new Headers(options.headers || {});

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
};