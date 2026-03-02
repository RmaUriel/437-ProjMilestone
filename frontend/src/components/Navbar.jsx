import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({ user, theme, onToggleTheme, onLogout }) {
    return (
        <header className="navbar">
            <div className="navbar-inner">
                <nav className="navlinks" aria-label="Primary">
                    <NavLink to="/" end className="navlink">
                        Home
                    </NavLink>
                    <NavLink to="/search" className="navlink">
                        Search
                    </NavLink>
                    <NavLink to="/profile" className="navlink">
                        Profile
                    </NavLink>
                    <NavLink to="/create-account" className="navlink">
                        Create Account
                    </NavLink>
                </nav>

                <div className="navActions">
                    <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    {user ? (
                        <button type="button" className="btn" onClick={onLogout}>
                            Log out
                        </button>
                    ) : null}
                </div>
            </div>
        </header>
    );
}