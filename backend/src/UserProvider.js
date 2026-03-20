import { getEnvVar } from "./getEnvVar.js";
import { ClassProvider } from "./ClassProvider.js";

export class UserProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.users = this.mongoClient
            .db()
            .collection(getEnvVar("USERS_COLLECTION_NAME"));
        this.classes = this.mongoClient
            .db()
            .collection(getEnvVar("CLASSES_COLLECTION_NAME") || "classes");
    }

    async ensureIndexes() {
        await this.users.createIndex({ username: 1 }, { unique: true });
        await this.users.createIndex({ email: 1 }, { unique: true });
    }

    async getUserByUsername(username) {
        return this.users.findOne(
            { username },
            {
                projection: {
                    _id: 0,
                },
            }
        );
    }

    async updateProfile(username, updates) {
        const allowedUpdates = {};
        const fields = ["firstName", "lastName", "gender", "pronouns", "phoneNumber", "major", "year", "bio"];

        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(updates, field)) {
                allowedUpdates[field] = String(updates[field] || "").trim();
            }
        }

        await this.users.updateOne(
            { username },
            {
                $set: allowedUpdates,
            }
        );

        return this.getUserByUsername(username);
    }

    async addClassToUser(username, className) {
        const { normalizedName } = ClassProvider.validateAndNormalize(className);
        const existingClass = await this.classes.findOne({ normalizedName });
        if (!existingClass) {
            throw new Error("Class does not exist.");
        }

        await this.users.updateOne(
            { username },
            {
                $addToSet: {
                    classes: existingClass.name,
                },
            }
        );

        return this.getUserByUsername(username);
    }

    async setProfileImage(username, profileImageUrl) {
        await this.users.updateOne(
            { username },
            {
                $set: { profileImageUrl },
            }
        );
        return this.getUserByUsername(username);
    }
}
