
import express from "express";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../src/getEnvVar.js";
import { ClassProvider } from "../src/ClassProvider.js";

function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { username },
            getEnvVar("JWT_SECRET"),
            { expiresIn: "1d" },
            (error, token) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(token);
            }
        );
    });
}

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

export function registerAuthRoutes(app, credentialsProvider, classProvider, userProvider) {
    const router = express.Router();

    router.post("/auth/register", async (req, res) => {
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
            } = req.body ?? {};

            if (!username || !firstName || !lastName || !email || !password) {
                return res.status(400).send({ error: "Missing required fields." });
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

            const token = await generateAuthToken(user.username);
            return res.status(201).send({ token, user });
        } catch (err) {
            return res.status(400).send({ error: err.message });
        }
    });

    router.post("/auth/login", async (req, res) => {
        try {
            const username = String(req.body?.username || "").trim();
            const password = String(req.body?.password || "");

            if (!username || !password) {
                return res.status(400).send({ error: "Missing username or password." });
            }

            const isValid = await credentialsProvider.verifyPassword(username, password);
            if (!isValid) {
                return res.status(401).send({ error: "Invalid username or password." });
            }

            const user = await userProvider.getUserByUsername(username);
            if (!user) {
                return res.status(404).send({ error: "User not found." });
            }

            const token = await generateAuthToken(user.username);
            return res.status(200).send({ token, user });
        } catch (err) {
            return res.status(500).send({ error: err.message });
        }
    });

    app.use("/api", router);
}
