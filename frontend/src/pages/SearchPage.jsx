import "../styles/Search.css";

export default function SearchPage({ user, groups = [], onJoinGroup }) {
    return (
        <>
            <main>
                <div className="group-table" role="region" aria-labelledby="search-heading">
                    <h1 id="search-heading">Search available study groups</h1>

                    {!groups.length ? (
                        <p>No groups available yet.</p>
                    ) : (
                        <>
                            {!user && (
                                <p>
                                    You can browse groups, but you must create an account to join them.
                                </p>
                            )}

                            <div className="table-wrapper" style={{ overflowX: "auto" }}>
                                <table className="class-group-table" role="table" aria-label="Study groups">
                                    <thead>
                                    <tr>
                                        <th scope="col">Class</th>
                                        <th scope="col">Subject</th>
                                        <th scope="col">Group</th>
                                        <th scope="col">Meeting</th>
                                        <th scope="col" aria-hidden="true"></th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {groups.map((g) => {
                                        const alreadyJoined = !!(user && user.joinedGroupIds?.includes(g.id));
                                        return (
                                            <tr key={g.id}>
                                                <td data-label="Class">{g.classCode}</td>
                                                <td data-label="Subject">{g.subject ?? "N/A"}</td>
                                                <td data-label="Group">{g.name}</td>
                                                <td data-label="Meeting">{g.meeting ?? "TBD"}</td>
                                                <td data-label="Action">
                                                    <button
                                                        className="btn"
                                                        onClick={() => onJoinGroup && onJoinGroup(g.id)}
                                                        disabled={!user || alreadyJoined}
                                                        aria-disabled={!user || alreadyJoined}
                                                        aria-pressed={alreadyJoined}
                                                        title={
                                                            !user
                                                                ? "Create an account to join"
                                                                : alreadyJoined
                                                                    ? "You already joined"
                                                                    : `Join ${g.name}`
                                                        }
                                                    >
                                                        {alreadyJoined ? "Joined" : "Join"}
                                                    </button>
                                                </td>
                                            </tr>
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