import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const DEFAULT_PROFILE_IMAGE = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27%23d9d9d9%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23555%27 font-size=%2720%27%3EProfile%3C/text%3E%3C/svg%3E";


export default function ProfilePage({
                                        user,
                                        joinedGroups,
                                        onUpdateProfile,
                                        onAddClass,
                                        onLeaveGroup,
                                        onUploadProfileImage,
                                    }) {
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [newClass, setNewClass] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    const [draft, setDraft] = useState({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        major: user.major ?? "",
        year: user.year ?? "",
        gender: user.gender ?? "",
        pronouns: user.pronouns ?? "",
        phoneNumber: user.phoneNumber ?? "",
        bio: user.bio ?? "",
    });


    const classesText = useMemo(() => (user.classes?.length ? user.classes.join(", ") : "None Yet"), [user.classes]);
    const groupsText = useMemo(() => {
        if (!joinedGroups?.length) return "None yet";
        return joinedGroups.map((group) => `${group.className}: ${group.groupName}`).join(", ");
    }, [joinedGroups]);

    async function handleSave() {
        setError("");
        try{
            await onUpdateProfile(draft);
            setEditing(false);
        } catch(err) {
            setError(err.message);
        }
    }

    function handleCancel() {
        setDraft({
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            major: user.major ?? "",
            year: user.year ?? "",
            gender: user.gender ?? "",
            pronouns: user.pronouns ?? "",
            phoneNumber: user.phoneNumber ?? "",
            bio: user.bio ?? "",
        });
        setEditing(false);
    }

    async function handleAddClass() {
        setError("");
        try {
            await onAddClass(newClass);
            setNewClass("");
        } catch(err) {
            setError(err.message);
        }
    }

    async function handleUploadImage() {
        if (!selectedFile) return;
        setError("");
        try {
            await onUploadProfileImage(selectedFile);
            setSelectedFile(null);
        } catch (err) {
            setError(err.message);
        }
    }


    return (
        <>
            <header>
                <img
                    className="profile-pic"
                    src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                    alt={`${user.firstName} ${user.lastName}'s profile`}
                />
            </header>

            <main>
                <section className="your-info">
                    <div className="field">
                        <h3>Username</h3>
                        <span className="value">{user.username}</span>
                    </div>

                    <div className="field">
                        <h3>First Name</h3>
                        {!editing ? <span className="value">{user.firstName}</span> : <input value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Last Name</h3>
                        {!editing ? <span className="value">{user.lastName}</span> : <input value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Major</h3>
                        {!editing ? <span className="value">{user.major}</span> : <input value={draft.major} onChange={(e) => setDraft({ ...draft, major: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Year</h3>
                        {!editing ? <span className="value">{user.year}</span> : <input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Gender</h3>
                        {!editing ? <span className="value">{user.gender}</span> : <input value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Pronouns</h3>
                        {!editing ? <span className="value">{user.pronouns}</span> : <input value={draft.pronouns} onChange={(e) => setDraft({ ...draft, pronouns: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Phone Number</h3>
                        {!editing ? <span className="value">{user.phoneNumber}</span> : <input value={draft.phoneNumber} onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Bio</h3>
                        {!editing ? <span className="value">{user.bio}</span> : <textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />}
                    </div>

                    <div className="field">
                        <h3>Classes</h3>
                        <span className="value">{classesText}</span>
                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="Add a class (e.g., CSC 437)" aria-label="Add class" />
                            <button type="button" onClick={handleAddClass}>Add Class</button>
                        </div>
                    </div>

                    <div className="field">
                        <h3>Groups</h3>
                        <span className="value">{groupsText}</span>
                    </div>

                    <div className="field">
                        <h3>Profile Image</h3>
                        <input type="file" accept="image/png,image/jpeg" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                        <button type="button" onClick={handleUploadImage} style={{ marginTop: 8 }}>
                            Upload Picture
                        </button>
                    </div>
                </section>

                {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

                <section className="buttons">
                    {!editing ? (
                        <button type="button" onClick={() => setEditing(true)}>Update</button>
                    ) : (
                        <>
                            <button type="button" onClick={handleSave}>Save</button>
                            <button type="button" onClick={handleCancel}>Cancel</button>
                        </>
                    )}

                    <button type="button" onClick={() => navigate("/search")}>Search</button>
                    <button type="button" onClick={() => navigate("/create-group")}>Create Group</button>
                </section>

                <section id="joined-groups" style={{ marginTop: 24 }}>
                    <h2>Your Joined Groups</h2>
                    {!joinedGroups?.length ? (
                        <p>You haven’t joined any groups yet. Go to Search to join one.</p>
                    ) : (
                        <ul>
                            {joinedGroups.map((group) => (
                                <li key={group.id} style={{ marginBottom: 8 }}>
                                    <strong>{group.className}</strong> — {group.groupName} ({group.meeting}){" "}
                                    <button type="button" onClick={() => onLeaveGroup(group.id)}>Leave</button>
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