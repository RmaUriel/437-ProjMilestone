import { useNavigate } from "react-router-dom";
import "../styles/Homepage.css";

export default function HomePage({user}) {
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
                        <li>View other student profiles inside each group</li>
                    </ol>
                </section>

                <button type="button" onClick={() => navigate(user ? "/search" : "/create-account")}>
                    {user ? "Browser Groups" : "Create Account"}
                </button>


            </main>

            <footer>
                <p>&copy; Study Group Finder UHV</p>
            </footer>
        </>
    );
}