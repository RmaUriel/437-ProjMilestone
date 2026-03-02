import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import HomePage from "./pages/HomePage.jsx";
import CreateAccountPage from "./pages/CreateAccountPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import myPhoto from "./images/my-photo.jpeg";

function makeId() {
    return crypto.randomUUID();
}

// Mock  data
const initialUser = {
    id: "u1",
    name: "Uriel Hernandez",
    major: "Computer Science",
    year: "4",
    gender: "Male",
    bio: "THis is draft",
    classes: ["CSC 437", "CSC 453", "CSC 313"],
    joinedGroupIds: ["g1"],
    photo: myPhoto,
};

const initialGroups = [
    { id: "g1", classCode: "CSC 437", name: "Intro to Web Development", meeting: "Tue 6pm" },
    { id: "g2", classCode: "CSC 453", name: "Operating Systems", meeting: "Thu 5pm" },
    { id: "g3", classCode: "CSC 313", name: "Teaching Computing", meeting: "Mon 4pm" },
];

export default function App() {
    // start null if not logged in
    const [user, setUser] = useState(initialUser);

    const [groups, setGroups] = useState(initialGroups);

    const [theme, setTheme] = useState("light"); // "light" oir "dark"

    const joinedGroups = useMemo(() => {
        if (!user) return [];
        return groups.filter((g) => user.joinedGroupIds.includes(g.id));
    }, [user, groups]);

    function toggleTheme() {
        setTheme((t) => (t === "light" ? "dark" : "light"));
    }


    function updateProfile(updates) {
        setUser((prev) => {
            if (!prev) return prev;
            return { ...prev, ...updates };
        });
    }

    function addClass(classCode) {
        const trimmed = classCode.trim();
        if (!trimmed) return;
        setUser((prev) => {
            if (!prev) return prev;
            if (prev.classes.includes(trimmed)) return prev;
            return { ...prev, classes: [...prev.classes, trimmed] };
        });
    }

    function joinGroup(groupId) {
        setUser((prev) => {
            if (!prev) return prev;
            if (prev.joinedGroupIds.includes(groupId)) return prev;
            return { ...prev, joinedGroupIds: [...prev.joinedGroupIds, groupId] };
        });
    }

    function leaveGroup(groupId) {
        setUser((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                joinedGroupIds: prev.joinedGroupIds.filter((id) => id !== groupId),
            };
        });
    }

    function createAccount(formData) {
        const newUser = {
            id: makeId(),
            name: formData.name || "New User",
            major: formData.major || "",
            year: formData.year || "",
            gender: formData.gender || "",
            bio: formData.bio || "",
            classes: formData.classes?.length ? formData.classes : [],
            joinedGroupIds: [],
        };
        setUser(newUser);
    }

    function logout() {
        setUser(null);
    }

    return (
        <div data-theme={theme} className="appRoot">
            <Navbar
                user={user}
                theme={theme}
                onToggleTheme={toggleTheme}
                onLogout={logout}
            />

            <main className="appMain">
                <Routes>
                    <Route
                        path="/"
                        element={<HomePage user={user} />}
                    />

                    <Route
                        path="/create-account"
                        element={
                            <CreateAccountPage
                                user={user}
                                onCreateAccount={createAccount}
                            />
                        }
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
                                />
                            ) : (
                                <Navigate to="/create-account" replace />
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
                            />
                        }
                    />

                    <Route path="*" element={<div style={{ padding: 16 }}>Not found</div>} />
                </Routes>
            </main>
        </div>
    );
}