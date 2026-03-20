import { useMemo, useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/Homepage.jsx";
import CreateAccountPage from "./pages/CreateAccountPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CreateGroupPage from "./pages/CreateGroupPage.jsx";
import { api, AUTH_TOKEN_KEY, SESSION_KEY } from "./api.js";

export default function App() {

    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [theme, setTheme] = useState("light"); // "light" oir "dark"
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState("");

    async function refreshGroups() {
        const data = await api.getGroups();
        setGroups(data.groups || []);
    }

    async function refreshUser(username) {
        const data = await api.getUser(username);
        setUser(data.user || null);
    }

    useEffect(() => {
        async function initializeApp() {
            try {
                const username = localStorage.getItem(SESSION_KEY);
                const token = localStorage.getItem(AUTH_TOKEN_KEY);

                await refreshGroups();

                if (username && token) {
                    await refreshUser(username);
                } else {
                    localStorage.removeItem(SESSION_KEY);
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                    setUser(null);
                }
            } catch (err) {
                setGlobalError(err.message);
                localStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(AUTH_TOKEN_KEY);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        initializeApp();
    }, []);



    const joinedGroups = useMemo(() => {
        if (!user) return [];
        return groups.filter((group) => (group.members || []).includes(user.username));
    }, [groups, user]);

    function toggleTheme() {
        setTheme((t) => (t === "light" ? "dark" : "light"));
    }

    async function createAccount(formData) {
        setGlobalError("");
        const data = await api.register(formData);
        localStorage.setItem(SESSION_KEY, data.user.username);
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        setUser(data.user);
        await refreshGroups();
    }

    async function login(credentials) {
        setGlobalError("");
        const data = await api.login(credentials);
        localStorage.setItem(SESSION_KEY, data.user.username);
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);

        setUser(data.user);
        await refreshGroups();
    }


    async function updateProfile(updates) {
        if (!user){
            return;
        }
        setGlobalError("");
        const data = await api.updateUser(user.username, updates);
        setUser(data.user);
    }

    async function uploadProfileImage(file) {
        if (!user || !file) return;
        setGlobalError("");
        const data = await api.uploadProfileImage(user.username, file);
        setUser(data.user);
    }

    async function addClass(className) {
        if (!user) return;
        setGlobalError("");
        const data = await api.addClass(user.username, className);
        setUser(data.user);
    }

    async function createGroup(payload) {
        if (!user) {
            return;
        }
        setGlobalError("");
        const data = await api.createGroup(payload);
        setGroups(data.groups || []);
    }

    async function joinGroup(groupId) {
        if (!user) {
            setGlobalError("Please log in first.");
            return;
        }

        try {
            setGlobalError("");
            const data = await api.joinGroup(groupId);
            setGroups(data.groups || []);
        } catch (err) {
            setGlobalError(err.message);
        }
    }

    async function leaveGroup(groupId) {
        if (!user) {
            setGlobalError("Please log in first.");
            return;
        }
        try {
            setGlobalError("");
            const data = await api.leaveGroup(groupId);
            setGroups(data.groups || []);
        } catch (err) {
            setGlobalError(err.message);
        }
    }

    async function updateGroup(groupId, updates) {
        if (!user) {
            setGlobalError("Only owner can update group.");
            return;
        }
        try {
            setGlobalError("");
            const data = await api.updateGroup(groupId, updates);
            setGroups(data.groups || []);
        } catch (err) {
            setGlobalError(err.message);
        }
    }


    function logout() {
        localStorage.removeItem(SESSION_KEY)
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
    }

    if (loading) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    return (
        <div data-theme={theme} className="appRoot">
            <Navbar user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={logout} />

            <main className="appMain">
                {globalError ? <p style={{ color: "crimson", padding: 16 }}>{globalError}</p> : null}
                <Routes>
                    <Route path="/" element={<HomePage user={user} />} />

                    <Route
                        path="/create-account"
                        element={<CreateAccountPage onCreateAccount={createAccount} />}
                    />
                    <Route
                        path="/login"
                        element={<LoginPage onLogin={login} />}
                    />

                    <Route
                        path="/profile"
                        element={
                            user ? (
                                <ProfilePage
                                    user={user}
                                    joinedGroups={joinedGroups}
                                    onUpdateProfile={updateProfile}
                                    onAddClass={addClass}
                                    onLeaveGroup={leaveGroup}
                                    onUploadProfileImage={uploadProfileImage}
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/search"
                        element={
                        <SearchPage
                            user={user}
                            groups={groups}
                            onJoinGroup={joinGroup}
                            onLeaveGroup={leaveGroup}
                            onUpdateGroup={updateGroup}
                        />}
                    />

                    <Route
                        path="/create-group"
                        element={
                            user ? (
                                <CreateGroupPage user={user} onCreateGroup={createGroup} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route path="*" element={<div style={{ padding: 16 }}>Not found</div>} />
                </Routes>
            </main>
        </div>
    );
}
