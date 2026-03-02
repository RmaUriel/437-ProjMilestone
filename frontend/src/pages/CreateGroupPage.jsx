import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Create-Group.css";

export default function CreateGroupPage({ onCreateGroup }) {
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState("");
    const [major, setMajor] = useState("computer-science");
    const [instructor, setInstructor] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [groupSize, setGroupSize] = useState("4");
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!groupName.trim()) {
            setError("Please provide a group name.");
            return;
        }
        if (!courseNumber.trim()) {
            setError("Please provide a course number.");
            return;
        }

        const form = {
            name: groupName.trim(),
            classCode: courseNumber.trim(),
            subject: major,
            instructor: instructor.trim(),
            meeting: "TBD",
            capacity: Number(groupSize),
        };

        if (typeof onCreateGroup === "function") {
            onCreateGroup(form);
        }

        // after creating, navigate to search to see the group
        navigate("/search");
    }

    return (
        <div className="page create-group-page" style={{ padding: 16 }}>
            <h1>Group Creation Form</h1>
            <p>Fill out the details below to create your new group</p>

            <section className="group-information">
                <form onSubmit={handleSubmit} aria-label="Create group form">
                    <label htmlFor="groupName">Group Name</label>
                    <input
                        id="groupName"
                        name="groupName"
                        type="text"
                        placeholder="Group Name"
                        required
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />

                    <label htmlFor="major">Major</label>
                    <select
                        id="major"
                        name="major"
                        required
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                    >
                        <option value="computer-science">Computer Science</option>
                        <option value="history">History</option>
                        <option value="math">Math</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="biology">Biology</option>
                    </select>

                    <label htmlFor="class-instructor">Class Instructor</label>
                    <input
                        id="class-instructor"
                        name="class-instructor"
                        type="text"
                        placeholder="Class Instructor"
                        required
                        value={instructor}
                        onChange={(e) => setInstructor(e.target.value)}
                    />

                    <label htmlFor="course-number">Course Number</label>
                    <input
                        id="course-number"
                        name="course-number"
                        type="text"
                        placeholder="Course Number (e.g., CSC 437)"
                        required
                        value={courseNumber}
                        onChange={(e) => setCourseNumber(e.target.value)}
                    />

                    <label htmlFor="group-size">Group Size</label>
                    <select
                        id="group-size"
                        name="group-size"
                        required
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                    >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={String(n)}>
                                {n}
                            </option>
                        ))}
                    </select>

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