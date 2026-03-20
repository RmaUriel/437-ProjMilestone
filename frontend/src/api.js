async function request(path, options = {}) {
    const response = await fetch(path, {
        headers: {
            ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }
    return data;
}

export const api = {
    register(payload) {
        return request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    login(payload) {
        return request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    getUser(username) {
        return request(`/api/users/${encodeURIComponent(username)}`);
    },
    updateUser(username, payload) {
        return request(`/api/users/${encodeURIComponent(username)}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    addClass(username, className) {
        return request(`/api/users/${encodeURIComponent(username)}/classes`, {
            method: "POST",
            body: JSON.stringify({ className }),
        });
    },
    uploadProfileImage(username, file) {
        const formData = new FormData();
        formData.append("profileImage", file);
        return request(`/api/users/${encodeURIComponent(username)}/profile-image`, {
            method: "POST",
            body: formData,
        });
    },
    getGroups() {
        return request("/api/groups");
    },
    createGroup(payload) {
        return request("/api/groups", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    updateGroup(groupId, payload) {
        return request(`/api/groups/${encodeURIComponent(groupId)}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },

    joinGroup(groupId, username) {
        return request(`/api/groups/${groupId}/join`, {
            method: "POST",
            body: JSON.stringify({ username }),
        });
    },
    leaveGroup(groupId, username) {
        return request(`/api/groups/${groupId}/leave`, {
            method: "POST",
            body: JSON.stringify({ username }),
        });
    },
};