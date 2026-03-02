import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function ProfilePage({
                                        user,
                                        joinedGroups,
                                        onUpdateProfile,
                                        onAddClass,
                                        onLeaveGroup,
                                        onCreateGroup,
                                    }) {
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);

    const [draft, setDraft] = useState({
        name: user.name ?? "",
        major: user.major ?? "",
        year: user.year ?? "",
        gender: user.gender ?? "",
        bio: user.bio ?? "",
    });

    const [newClass, setNewClass] = useState("");

    const classesText = useMemo(() => user.classes.join(", "), [user.classes]);
    const groupsText = useMemo(() => {
        if (!joinedGroups?.length) return "None yet";
        return joinedGroups.map((g) => `${g.classCode}: ${g.name}`).join(", ");
    }, [joinedGroups]);

    function handleSave() {
        onUpdateProfile(draft);
        setEditing(false);
    }

    function handleCancel() {
        setDraft({
            name: user.name ?? "",
            major: user.major ?? "",
            year: user.year ?? "",
            gender: user.gender ?? "",
            bio: user.bio ?? "",
        });
        setEditing(false);
    }

    function handleAddClass() {
        onAddClass(newClass);
        setNewClass("");
    }

    function handleViewGroups() {
        const el = document.getElementById("joined-groups");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <>
            <header>
                {/* YOUR PHOTO HERE */}
                <img
                    className="profile-pic"
                    src={user.photo}
                    alt={`${user.name}'s profile`}
                />
            </header>

            <main>
                <section className="your-info">
                    <div className="field">
                        <h3>Name</h3>
                        {!editing ? (
                            <span id="name" className="value">{user.name}</span>
                        ) : (
                            <input
                                aria-label="Name"
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="field">
                        <h3>Major</h3>
                        {!editing ? (
                            <span id="major" className="value">{user.major}</span>
                        ) : (
                            <input
                                aria-label="Major"
                                value={draft.major}
                                onChange={(e) => setDraft({ ...draft, major: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="field">
                        <h3>Year</h3>
                        {!editing ? (
                            <span id="year" className="value">{user.year}</span>
                        ) : (
                            <input
                                aria-label="Year"
                                value={draft.year}
                                onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="field">
                        <h3>Gender</h3>
                        {!editing ? (
                            <span id="gender" className="value">{user.gender}</span>
                        ) : (
                            <input
                                aria-label="Gender"
                                value={draft.gender}
                                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="field">
                        <h3>Bio</h3>
                        {!editing ? (
                            <span id="bio" className="value">{user.bio}</span>
                        ) : (
                            <textarea
                                aria-label="Bio"
                                value={draft.bio}
                                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                            />
                        )}
                    </div>

                    <div className="field">
                        <h3>Classes</h3>
                        <span id="classes" className="value">{classesText}</span>

                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <input
                                value={newClass}
                                onChange={(e) => setNewClass(e.target.value)}
                                placeholder="Add a class (e.g., CSC 437)"
                                aria-label="Add class"
                                style={{ minWidth: 220 }}
                            />
                            <button type="button" onClick={handleAddClass}>
                                Add Class
                            </button>
                        </div>
                    </div>

                    <div className="field">
                        <h3>Groups</h3>
                        <span id="groups" className="value">{groupsText}</span>
                    </div>
                </section>

                <section className="buttons">
                    {!editing ? (
                        <button type="button" onClick={() => setEditing(true)}>
                            Update
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={handleSave}>Save</button>
                            <button type="button" onClick={handleCancel}>Cancel</button>
                        </>
                    )}

                    <button type="button" onClick={() => navigate("/search")}>
                        Search
                    </button>

                    <button type="button" onClick={handleViewGroups}>
                        View Group
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (onCreateGroup) {
                                onCreateGroup();
                            }
                        }}
                    >
                        Create Group
                    </button>
                </section>

                <section id="joined-groups" style={{ marginTop: 24 }}>
                    <h2>Your Joined Groups</h2>
                    {!joinedGroups?.length ? (
                        <p>You haven’t joined any groups yet. Go to Search to join one.</p>
                    ) : (
                        <ul>
                            {joinedGroups.map((g) => (
                                <li key={g.id} style={{ marginBottom: 8 }}>
                                    <strong>{g.classCode}</strong> — {g.name} ({g.meeting}){" "}
                                    <button type="button" onClick={() => onLeaveGroup(g.id)}>
                                        Leave
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            <footer>
                <p>&copy; Study Group Finder UHV</p>
            </footer>
        </>
    );
}