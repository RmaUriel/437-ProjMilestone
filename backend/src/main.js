import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import { connectMongo } from "./connectMongo.js";
import { ClassProvider } from "./ClassProvider.js";
import { GroupProvider } from "./GroupProvider.js";
import { UserProvider } from "./UserProvider.js";
import { imageMiddlewareFactory, handleImageFileErrors } from "./imageUploadMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || path.resolve(__dirname, "../../frontend/dist");
const IMAGE_UPLOAD_DIR = getEnvVar("IMAGE_UPLOAD_DIR") || path.resolve(__dirname, "../uploads");

fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });

const app = express();
const mongoClient = connectMongo();
await mongoClient.connect();

const credentialsProvider = new CredentialsProvider(mongoClient);
const classProvider = new ClassProvider(mongoClient);
const userProvider = new UserProvider(mongoClient);
const groupProvider = new GroupProvider(mongoClient);

await credentialsProvider.ensureIndexes();
await classProvider.ensureIndexes();
await userProvider.ensureIndexes();
await groupProvider.ensureIndexes();

app.use(express.json());
app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(IMAGE_UPLOAD_DIR));

function normalizeClassList(classNames) {
    const unique = new Map();
    for (const className of classNames || []) {
        const classRecord = ClassProvider.validateAndNormalize(className);
        if (!unique.has(classRecord.normalizedName)) {
            unique.set(classRecord.normalizedName, classRecord.originalName);
        }
    }
    return [...unique.values()];
}

app.post("/api/auth/register", async (req, res) => {
    try {

        const {
            username,
            firstName,
            lastName,
            gender,
            pronouns,
            email,
            password,
            phoneNumber,
            major,
            year,
            bio,
            classes,
        } = req.body;

        if (!username || !firstName || !lastName || !email || !password) {
            res.status(400).send({ error: "Missing required fields." });
            return;
        }

        const normalizedClasses = normalizeClassList(classes);
        for (const className of normalizedClasses) {
            await classProvider.createClassIfNeeded(className);
        }

        const user = await credentialsProvider.registerUser({
            username: String(username).trim(),
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            gender: String(gender || "").trim(),
            pronouns: String(pronouns || "").trim(),
            email: String(email).trim(),
            password: String(password),
            phoneNumber: String(phoneNumber || "").trim(),
            major: String(major || "").trim(),
            year: String(year || "").trim(),
            bio: String(bio || "").trim(),
            classes: normalizedClasses,
        });

        res.status(201).send({ user });

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {

        const { username, password } = req.body;
        const isValid = await credentialsProvider.verifyPassword(String(username || "").trim(), String(password || ""));
        if (!isValid) {
            res.status(401).send({ error: "Invalid username or password." });
            return;
        }

        const user = await userProvider.getUserByUsername(String(username || "").trim());
        res.send({ user });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/api/users/:username", async (req, res) => {
    try {

        const user = await userProvider.getUserByUsername(req.params.username);
        if (!user) {
            res.status(404).send({ error: "User not found." });
            return;
        }
        res.send({ user });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.put("/api/users/:username", async (req, res) => {
    try {

        const user = await userProvider.updateProfile(req.params.username, req.body || {});
        res.send({ user });

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/users/:username/classes", async (req, res) => {
    try {

        const { className } = req.body;
        await classProvider.createClassIfNeeded(className);
        const user = await userProvider.addClassToUser(req.params.username, className);
        res.send({ user });

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post(
    "/api/users/:username/profile-image",
    imageMiddlewareFactory.single("profileImage"),
    async (req, res) => {
        try {

            if (!req.file) {
                res.status(400).send({ error: "Please upload a profile image." });
                return;
            }
            const profileImageUrl = `/uploads/${req.file.filename}`;
            const user = await userProvider.setProfileImage(req.params.username, profileImageUrl);
            res.send({ user });

        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    },
    handleImageFileErrors
);

app.get("/api/classes", async (req, res) => {
    try {
        const classes = await classProvider.getAllClasses();
        res.send({ classes });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/api/groups", async (req, res) => {
    try {

        const groups = await groupProvider.getAllGroups();
        res.send({ groups });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.post("/api/groups", async (req, res) => {
    try {

        const groups = await groupProvider.createGroup(req.body);
        res.status(201).send({ groups });

    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.put("/api/groups/:groupId", async (req, res) => {
    try {
        const groups = await groupProvider.updateGroup(req.params.groupId, req.body.username, req.body);
        res.send({ groups });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/groups/:groupId/join", async (req, res) => {
    try {
        const groups = await groupProvider.joinGroup(req.params.groupId, req.body.username);
        res.send({ groups });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/groups/:groupId/leave", async (req, res) => {
    try {
        const groups = await groupProvider.leaveGroup(req.params.groupId, req.body.username);
        res.send({ groups });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}. CTRL+C to stop.`);
});
