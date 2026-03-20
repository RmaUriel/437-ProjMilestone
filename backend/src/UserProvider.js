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
        await this.users.createIndex({ usernameLower: 1 }, { unique: true, sparse: true });
        await this.users.createIndex({ email: 1 }, { unique: true });
    }

    buildUsernameQuery(username) {
        const cleanUsername = String(username || "").trim();
        const normalizedUsername = cleanUsername.toLowerCase();

        return {
            $or: [
                { usernameLower: normalizedUsername },
                { username: cleanUsername },
            ],
        };
    }

    async getUserByUsername(username) {
        return this.users.findOne(
            this.buildUsernameQuery(username),
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
            this.buildUsernameQuery(username), {
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
            this.buildUsernameQuery(username),
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
            this.buildUsernameQuery(username),
            {
                $set: { profileImageUrl },
            }
        );
        return this.getUserByUsername(username);
    }
}
