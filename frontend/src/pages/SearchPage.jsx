import { Fragment, useMemo, useState } from "react";
import "../styles/Search.css";

const DEFAULT_PROFILE_IMAGE = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27%23d9d9d9%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23555%27 font-size=%2720%27%3EProfile%3C/text%3E%3C/svg%3E";


export default function SearchPage({ user, groups = [], onJoinGroup, onLeaveGroup, onUpdateGroup }) {
    const [expandedGroupId, setExpandedGroupId] = useState("");
    const [searchText, setSearchText] = useState("");
    const [editingGroupId, setEditingGroupId] = useState("");
    const [editError, setEditError] = useState("");
    const [editForm, setEditForm] = useState({
        className: "",
        groupName: "",
        meeting: "",
        groupBio: "",
    });

    const filteredGroups = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return groups;

        return groups.filter((group) => {
            const haystack = [
                group.className,
                group.groupName,
                group.meeting,
                group.groupBio,
                ...(group.memberProfiles || []).flatMap((member) => [
                    member.username,
                    member.firstName,
                    member.lastName,
                    member.major,
                    member.bio,
                ]),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [groups, searchText]);

    function startEditingGroup(group) {
        setEditingGroupId(group.id);
        setEditError("");
        setEditForm({
            className: group.className || "",
            groupName: group.groupName || "",
            meeting: group.meeting || "",
            groupBio: group.groupBio || "",
        });
    }

    async function handleUpdateGroup(groupId) {
        if (!user || !onUpdateGroup) {
            return;
        }

        setEditError("");
        try {
            // CHANGE START: submit creator edits for the selected group.
            await onUpdateGroup(groupId, editForm);
            setEditingGroupId("");
            // CHANGE END: submit creator edits for the selected group.
        } catch (err) {
            setEditError(err.message);
        }
    }

    return (
        <>
            <main>
                <div className="group-table" role="region" aria-labelledby="search-heading">
                    <h1 id="search-heading">Search available study groups</h1>

                    <input
                        type="text"
                        className="group-search-input"
                        placeholder="Search by class, group name, description, or student"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        aria-label="Search study groups"
                    />


                    {!filteredGroups.length ? (
                        <p>{groups.length ? "No groups match your search" : "No groups available yet."}</p>
                    ) : (
                        <>
                            {!user ?
                                <p>
                                    You can browse groups, but you must create an account to join them.
                                </p>
                            : null }

                            <div className="table-wrapper" style={{ overflowX: "auto" }}>
                                <table className="class-group-table" role="table" aria-label="Study groups">
                                    <thead>
                                        <tr>
                                            <th scope="col">Class</th>
                                            <th scope="col">Group</th>
                                            <th scope="col">Meeting</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Members</th>
                                            <th scope="col">Profiles</th>
                                            <th scope="col" aria-hidden="true"></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {filteredGroups.map((group) => {
                                        const alreadyJoined = !!(user && (group.members || []).includes(user.username));
                                        const isExpanded = expandedGroupId === group.id;
                                        const canEdit = !!user && String(group.createdBy || "").toLowerCase() === String(user.username || "").toLowerCase();
                                        const isEditing = editingGroupId === group.id;
                                        return (
                                            <Fragment key={group.id}>
                                            <tr>
                                                <td data-label="Class">{group.className}</td>
                                                <td data-label="Group">{group.groupName}</td>
                                                <td data-label="Meeting">{group.meeting ?? "TBD"}</td>
                                                <td data-label="Description">{group.groupBio || "No description"}</td>
                                                <td data-label="Members">{group.memberCount}/10</td>
                                                <td data-label="Profiles">
                                                    <button type="button" className="btn" onClick={() => setExpandedGroupId(isExpanded ? "" : group.id)}>
                                                        {isExpanded ? "Hide" : "View"}
                                                    </button>
                                                </td>

                                                <td data-label="Action">
                                                    {alreadyJoined ? (
                                                        <button className="btn" onClick={() => onLeaveGroup(group.id)}>
                                                            Leave
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn"
                                                            onClick={() => onJoinGroup(group.id)}
                                                            disabled={!user || group.memberCount >= 10}
                                                            title={
                                                                !user
                                                                    ? "Create an account to join"
                                                                    : alreadyJoined
                                                                        ? "You already joined"
                                                                        : `Join ${group.groupName}`
                                                            }
                                                        >
                                                           Join
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                                {isExpanded ? (
                                                    <tr>
                                                        <td colSpan="7">
                                                            <div style={{ padding: 12 }}>
                                                                <strong>Student Profiles</strong>
                                                                {!group.memberProfiles?.length ? (
                                                                    <p>No student profiles available.</p>
                                                                ) : (
                                                                    <div className="member-profile-grid">
                                                                        {group.memberProfiles.map((member) => (
                                                                            <div key={member.username} className="member-profile-card">
                                                                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                                                    <img
                                                                                        src={member.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                                                                                        alt={`${member.firstName} ${member.lastName}`}
                                                                                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%" }}
                                                                                    />
                                                                                    <div>
                                                                                        <h3 style={{ margin: 0 }}>{member.firstName} {member.lastName}</h3>
                                                                                        <p style={{ margin: "4px 0" }}>@{member.username}</p>
                                                                                        <p style={{ margin: "4px 0" }}>{member.major} • {member.year}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <p style={{ marginTop: 8 }}>{member.bio || "No bio yet."}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {canEdit ? (
                                                                    <div className="group-edit-panel">
                                                                        {/* CHANGE START: show inline edit form only for the group creator. */}
                                                                        <strong>Edit Group</strong>
                                                                        <p style={{ marginTop: 8 }}>As the creator, you can update this group.</p>

                                                                        <label htmlFor={`className-${group.id}`}>Class</label>
                                                                        <input
                                                                            id={`className-${group.id}`}
                                                                            value={isEditing ? editForm.className : group.className}
                                                                            onFocus={() => {
                                                                                if (!isEditing) {
                                                                                    startEditingGroup(group);
                                                                                }
                                                                            }}
                                                                            onChange={(e) =>
                                                                                setEditForm((current) => ({ ...current, className: e.target.value }))
                                                                            }
                                                                        />

                                                                        <label htmlFor={`groupName-${group.id}`}>Group Name</label>
                                                                        <input
                                                                            id={`groupName-${group.id}`}
                                                                            value={isEditing ? editForm.groupName : group.groupName}
                                                                            onFocus={() => {
                                                                                if (!isEditing) {
                                                                                    startEditingGroup(group);
                                                                                }
                                                                            }}
                                                                            onChange={(e) =>
                                                                                setEditForm((current) => ({ ...current, groupName: e.target.value }))
                                                                            }
                                                                        />

                                                                        <label htmlFor={`meeting-${group.id}`}>Meeting</label>
                                                                        <input
                                                                            id={`meeting-${group.id}`}
                                                                            value={isEditing ? editForm.meeting : (group.meeting || "")}
                                                                            onFocus={() => {
                                                                                if (!isEditing) {
                                                                                    startEditingGroup(group);
                                                                                }
                                                                            }}
                                                                            onChange={(e) =>
                                                                                setEditForm((current) => ({ ...current, meeting: e.target.value }))
                                                                            }
                                                                        />

                                                                        <label htmlFor={`groupBio-${group.id}`}>Description</label>
                                                                        <textarea
                                                                            id={`groupBio-${group.id}`}
                                                                            rows={4}
                                                                            value={isEditing ? editForm.groupBio : (group.groupBio || "")}
                                                                            onFocus={() => {
                                                                                if (!isEditing) {
                                                                                    startEditingGroup(group);
                                                                                }
                                                                            }}
                                                                            onChange={(e) =>
                                                                                setEditForm((current) => ({ ...current, groupBio: e.target.value }))
                                                                            }
                                                                        />

                                                                        {editError && isEditing ? (
                                                                            <div role="alert" style={{ color: "crimson", marginTop: 8 }}>
                                                                                {editError}
                                                                            </div>
                                                                        ) : null}

                                                                        <div className="group-edit-actions">
                                                                            <button
                                                                                type="button"
                                                                                className="btn"
                                                                                onClick={() => startEditingGroup(group)}
                                                                            >
                                                                                Load Current Values
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                className="btn"
                                                                                onClick={() => handleUpdateGroup(group.id)}
                                                                            >
                                                                                Save Changes
                                                                            </button>
                                                                        </div>
                                                                        {/* CHANGE END: show inline edit form only for the group creator. */}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer>
                <p>&copy; Study Group Finder UHV</p>
            </footer>
        </>
    );
}