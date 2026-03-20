import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Create-Group.css";

export default function CreateGroupPage({ onCreateGroup, user}) {
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState("");
    const [meeting, setMeeting] = useState("");
    const [groupBio, setGroupBio] = useState("");
    const [className, setClassName] = useState(user.classes?.[0] || "");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!groupName.trim()) {
            setError("Please provide a group name.");
            return;
        }
        if (!className.trim()) {
            setError("Please choose or enter a class.");
            return;
        }
        if (!groupName.trim()) {
            setError("Please provide a group name.");
            return;
        }

        try {
            await onCreateGroup({
                className,
                groupName: groupName.trim(),
                meeting: meeting.trim() || "TBD",
                groupBio: groupBio.trim(),
            });
            navigate("/search");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="page create-group-page" style={{ padding: 16 }}>
            <h1>Group Creation Form</h1>
            <p>Fill out the details below to create your new group</p>

            <section className="group-information">
                <form onSubmit={handleSubmit} aria-label="Create group form">

                    <label htmlFor="className">Class</label>
                    <input
                        id="className"
                        name="className"
                        type="text"
                        placeholder="CSC 437"
                        required
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                    />

                    <datalist id="user-classes">
                        {(user.classes || []).map((course) => (
                            <option key={course} value={course} />
                        ))}
                    </datalist>

                    <label htmlFor="groupName">Group Name</label>
                    <input id="groupName"
                           type="text"
                           required
                           value={groupName}
                           onChange={(e) => setGroupName(e.target.value)} />

                    <label htmlFor="meeting">Meeting Time</label>
                    <input id="meeting"
                           type="text"
                           placeholder="Mon 12pm"
                           value={meeting}
                           onChange={(e) => setMeeting(e.target.value)} />

                    <label htmlFor="groupBio">Group Description (Optional)</label>
                    <textarea
                        id="groupBio"
                        rows={4}
                        placeholder="Share what the group is studying, how often you meet, or what kind of members you want."
                        value={groupBio}
                        onChange={(e) => setGroupBio(e.target.value)}
                    />

                    {error && (
                        <div role="alert" style={{ color: "crimson", marginTop: 8 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                        <button type="submit" className="btn">
                            Create Group
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}