import { Link, useNavigate } from "react-router-dom";
import "../styles/Homepage.css";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            <main>
                <section className="welcome">
                    <h1>Welcome</h1>
                    <p>
                        Welcome to Study Group Finder! This is a new website where students can find
                        study groups based on their needs. To continue, please create a new account.
                    </p>
                </section>

                <section className="how-to-use">
                    <h1>How To Use</h1>
                    <ol>
                        <li>Create an account</li>
                        <li>Add your classes</li>
                        <li>Join or Create a study group</li>
                    </ol>
                </section>

                <button type="button" onClick={() => navigate("/create-account")}>
                    Create Account
                </button>

                {/* Temporary links (optional) — you can delete once your button UX is enough */}
                <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link to="/create-account">Account</Link>

                </div>
            </main>

            <footer>
                <p>&copy; Study Group Finder UHV</p>
            </footer>
        </>
    );
}