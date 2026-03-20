import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Create-Account.css";

export default function LoginPage({ onLogin }) {
    const navigate = useNavigate();


    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setLoginError("");
        try {
            setSubmitting(true);
            await onLogin({ username: loginUsername, password: loginPassword });
            navigate("/profile");
        } catch (err) {
            setLoginError(err.message);
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <div className="page create-account-page" style={{ padding: 16 }}>
            <h1>Log In</h1>
            <p>Sign in to your account to join and manage study groups.</p>

            <section className="info-input" style={{ marginTop: 24 }}>
                <form onSubmit={handleLogin} aria-label="Login form">
                    <label htmlFor="loginUsername">Username</label>
                    <input id="loginUsername" type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />

                    <label htmlFor="loginPassword">Password</label>
                    <input id="loginPassword" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

                    {loginError ? <div role="alert" style={{ color: "crimson", marginTop: 8 }}>{loginError}</div> : null}

                    <div style={{ marginTop: 12 }}>
                        <button type="submit" className="btn" disabled={submitting}>
                            Log In
                        </button>
                    </div>
                </form>
            </section>

            <footer style={{ marginTop: 24 }}>
                <p>&copy; Study Group Finder UHV</p>
            </footer>
        </div>
    );
}
