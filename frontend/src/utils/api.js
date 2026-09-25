const API_URL = "http://localhost:3000";

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = new Headers(options.headers || {});

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    // JWT expired / invalid
    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return response;
    }

    return response;
};