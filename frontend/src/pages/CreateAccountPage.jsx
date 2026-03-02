import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Create-Account.css";


export default function CreateAccountPage({ onCreateAccount }) {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("male");
    const [pronouns, setPronouns] = useState("she/her");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [major, setMajor] = useState("computer-science");
    const [year, setYear] = useState("first");
    const [bio, setBio] = useState("");
    const [classesChecked, setClassesChecked] = useState({
        CSC101: false,
        CSC202: false,
        CSC203: false,
    });

    const [formError, setFormError] = useState("");

    function toggleClass(classCode) {
        setClassesChecked((prev) => ({ ...prev, [classCode]: !prev[classCode] }));
    }

    function validatePhone(p) {
        return /^\d{3}-\d{3}-\d{4}$/.test(p);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        if (!firstName.trim() || !lastName.trim()) {
            setFormError("Please provide first and last name.");
            return;
        }
        if (!email.includes("@")) {
            setFormError("Please enter a valid email.");
            return;
        }
        if (!password || password.length < 6) {
            setFormError("Password must be at least 6 characters.");
            return;
        }
        if (!validatePhone(phoneNumber)) {
            setFormError("Phone number must be in the format 123-456-7890.");
            return;
        }

        const selectedClasses = Object.entries(classesChecked)
            .filter(([, checked]) => checked)
            .map(([code]) => code);

        const formData = {
            name: `${firstName.trim()} ${lastName.trim()}`,
            major,
            year,
            gender,
            pronouns,
            email,
            bio,
            classes: selectedClasses,
            phoneNumber,
        };

        // Call parent to create the mock account
        if (typeof onCreateAccount === "function") {
            onCreateAccount(formData);
        }

        // navigate to profile after creating account
        navigate("/profile");
    }

    return (
        <div className="page create-account-page" style={{ padding: 16 }}>
            <h1>Welcome</h1>
            <p>
                Thank you for deciding to create a new account.
                Please fill out the following information.
            </p>

            <section className="info-input">
                <form onSubmit={handleSubmit} aria-label="Create account form">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />

                    <label htmlFor="gender">Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-Binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>

                    <label htmlFor="pronouns">Pronouns</label>
                    <select
                        id="pronouns"
                        name="pronouns"
                        required
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                    >
                        <option value="she/her">She / Her</option>
                        <option value="he/him">He / Him</option>
                        <option value="they/them">They / Them</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                        <option value="other">Other</option>
                    </select>

                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby="password-help"
                    />
                    <div id="password-help" style={{ fontSize: 12, color: "#666" }}>
                        At least 6 characters for this prototype.
                    </div>

                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="123-456-7890"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        title="Phone number must be in the format 123-456-7890"
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

                    <label htmlFor="year">Year</label>
                    <select
                        id="year"
                        name="year"
                        required
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <option value="first">First</option>
                        <option value="second">Second</option>
                        <option value="third">Third</option>
                        <option value="fourth">Fourth</option>
                        <option value="fifth">Fifth</option>
                        <option value="transfer-1">Transfer 1st</option>
                        <option value="transfer-2">Transfer 2nd</option>
                        <option value="transfer-3">Transfer 3rd</option>
                    </select>

                    <label htmlFor="bio">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        placeholder="Bio"
                        rows={4}
                        required
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />

                    <fieldset>
                        <legend>Classes</legend>

                        <label>
                            <input
                                type="checkbox"
                                name="classes[]"
                                value="CSC101"
                                checked={classesChecked.CSC101}
                                onChange={() => toggleClass("CSC101")}
                            />
                            CSC 101
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                name="classes[]"
                                value="CSC202"
                                checked={classesChecked.CSC202}
                                onChange={() => toggleClass("CSC202")}
                            />
                            CSC 202
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                name="classes[]"
                                value="CSC203"
                                checked={classesChecked.CSC203}
                                onChange={() => toggleClass("CSC203")}
                            />
                            CSC 203
                        </label>
                    </fieldset>

                    {formError && (
                        <div role="alert" style={{ color: "crimson", marginTop: 8 }}>
                            {formError}
                        </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                        <button type="submit" className="btn">
                            Create Account
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