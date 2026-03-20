export default function ThemeToggle({ theme, onToggle }) {
    return (
        <button
            type="button"
            className="btn dark-toggle"
            onClick={onToggle}
            aria-pressed={theme === "dark"}
            aria-label="Toggle dark mode"
        >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
    );
}