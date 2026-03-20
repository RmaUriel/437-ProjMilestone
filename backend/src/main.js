
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
import { registerAuthRoutes } from "../routes/authRoutes.js";
import { verifyAuthToken } from "../routes/verifyAuthToken.js";

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

function requireSameUserParam(req, res, next) {
    const routeUsername = String(req.params.username || "").trim().toLowerCase();
    const authUsername = String(req.userInfo?.username || "").trim().toLowerCase();

    if (!routeUsername || !authUsername || routeUsername !== authUsername) {
        return res.status(403).send({ error: "You can only modify your own account." });
    }

    next();
}

registerAuthRoutes(app, credentialsProvider, classProvider, userProvider);


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

app.put("/api/users/:username", verifyAuthToken, requireSameUserParam, async (req, res) => {
    try {
        const user = await userProvider.updateProfile(req.params.username, req.body || {});
        res.send({ user });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/users/:username/classes", verifyAuthToken, requireSameUserParam, async (req, res) => {
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
    verifyAuthToken,
    requireSameUserParam,
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


app.post("/api/groups", verifyAuthToken, async (req, res) => {
    try {
        const groups = await groupProvider.createGroup({
            ...req.body,
            creatorUsername: req.userInfo.username,
        });
        res.status(201).send({ groups });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.put("/api/groups/:groupId", verifyAuthToken, async (req, res) => {
    try {
        const groups = await groupProvider.updateGroup(
            req.params.groupId,
            req.userInfo.username,
            req.body || {}
        );
        res.send({ groups });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/groups/:groupId/join", verifyAuthToken, async (req, res) => {
    try {
        const groups = await groupProvider.joinGroup(req.params.groupId, req.userInfo.username);
        res.send({ groups });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post("/api/groups/:groupId/leave", verifyAuthToken, async (req, res) => {
    try {
        const groups = await groupProvider.leaveGroup(req.params.groupId, req.userInfo.username);
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