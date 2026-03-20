import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Create-Account.css";


export default function CreateAccountPage({ onCreateAccount }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        firstName: "",
        lastName: "",
        gender: "male",
        pronouns: "she/her",
        email: "",
        password: "",
        phoneNumber: "",
        major: "computer-science",
        year: "first",
        bio: "",
        classesText: "",
    });

    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function validatePhone(p) {
        return /^\d{3}-\d{3}-\d{4}$/.test(p);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        if (!form.username.trim()){
            setFormError("Please provide a username");
            return;
        }
        if (!form.firstName.trim() || !form.lastName.trim()) {
            setFormError("Please provide first and last name.");
            return;
        }
        if (!form.email.includes("@")) {
            setFormError("Please enter a valid email.");
            return;
        }
        if (!form.password || form.password.length < 6) {
            setFormError("Password must be at least 6 characters.");
            return;
        }
        if (!validatePhone(form.phoneNumber)) {
            setFormError("Phone number must be in the format 123-456-7890.");
            return;
        }

        const selectedClasses = form.classesText
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

        try {
            setSubmitting(true);
            await onCreateAccount({
                username: form.username,
                firstName: form.firstName,
                lastName: form.lastName,
                gender: form.gender,
                pronouns: form.pronouns,
                email: form.email,
                password: form.password,
                phoneNumber: form.phoneNumber,
                major: form.major,
                year: form.year,
                bio: form.bio,
                classes: selectedClasses,
            });
            navigate("/profile");
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }

    }

    return (
        <div className="page create-account-page" style={{ padding: 16 }}>
            <h1>Welcome</h1>
            <p>
                Create a new account to start joining and creating studying groups.
            </p>

            <section className="info-input">
                <form onSubmit={handleSubmit} aria-label="Create account form">

                    <label htmlFor="username">Username:</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        value={form.username}
                        onChange={(e) => updateField("username", e.target.value)} />

                    <label htmlFor="firstName">First Name:</label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        required
                        value={form.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                    />

                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        required
                        value={form.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                    />

                    <label htmlFor="gender">Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        required
                        value={form.gender}
                        onChange={(e) => updateField("gender", e.target.value)}
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
                        value={form.pronouns}
                        onChange={(e) => updateField("pronouns", e.target.value)}
                    >
                        <option value="he/him">He / Him</option>
                        <option value="she/her">She / Her</option>
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
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                    />

                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
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
                        value={form.phoneNumber}
                        onChange={(e) => updateField("phoneNumber", e.target.value)}
                        pattern={"^(\\d{3}-\\d{3}-\\d{4}|\\d{10})$"}
                        title="Enter 123-456-7890 or 1234567890"
                    />

                    <label htmlFor="major">Major</label>
                    <select
                        id="major"
                        name="major"
                        required
                        value={form.major}
                        onChange={(e) => updateField("major", e.target.value)}
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
                        value={form.year}
                        onChange={(e) => updateField("year", e.target.value)}
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
                        value={form.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                    />
                    <label htmlFor="classesText">Classes</label>
                    <input
                        id="classesText"
                        type="text"
                        placeholder="BIO 161, CSC 437"
                        value={form.classesText}
                        onChange={(e) => updateField("classesText", e.target.value)}
                    />
                    <small>Separate classes with commas. Class names are case-insensitive and allow only letters, numbers, and spaces.</small>

                    {formError ?
                        <div role="alert" style={{ color: "crimson", marginTop: 8 }}>
                            {formError}
                        </div>
                    : null}

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