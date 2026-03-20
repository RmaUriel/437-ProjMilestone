import bcrypt from "bcrypt";
import { getEnvVar } from "./getEnvVar.js";

export class CredentialsProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.creds = this.mongoClient
            .db()
            .collection(getEnvVar("CREDS_COLLECTION_NAME"));
        this.users = this.mongoClient
            .db()
            .collection(getEnvVar("USERS_COLLECTION_NAME"));
    }

    async ensureIndexes() {
        await this.creds.createIndex({ username: 1 }, { unique: true });
    }

    async registerUser(userDoc) {
        const { username, email, password } = userDoc;

        const existingUser = await this.users.findOne({
            $or: [{ username }, { email }],
        });
        const existingCred = await this.creds.findOne({ username });
        if (existingUser || existingCred) {
            throw new Error("A user with that username or email already exists.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await this.creds.insertOne({
            username,
            password: hashedPassword,
        });

        await this.users.insertOne({
            username,
            email,
            firstName: userDoc.firstName,
            lastName: userDoc.lastName,
            gender: userDoc.gender,
            pronouns: userDoc.pronouns,
            phoneNumber: userDoc.phoneNumber,
            major: userDoc.major,
            year: userDoc.year,
            bio: userDoc.bio,
            classes: Array.isArray(userDoc.classes) ? userDoc.classes : [],
            profileImageUrl: userDoc.profileImageUrl || "",
            createdAt: new Date(),
        });

        return this.users.findOne({ username }, { projection: { _id: 0 } });
    }

    async verifyPassword(username, password) {
        const credsRecord = await this.creds.findOne({ username });
        if (!credsRecord) {
            return false;
        }
        return bcrypt.compare(password, credsRecord.password);
    }
}
