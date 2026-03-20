import { getEnvVar } from "./getEnvVar.js";

const CLASS_NAME_REGEX = /^[A-Za-z0-9 ]+$/;

function normalizeClassName(className) {
    return String(className || "")
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();
}

export class ClassProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.classes = this.mongoClient
            .db()
            .collection(getEnvVar("CLASSES_COLLECTION_NAME") || "classes");
    }

    static validateAndNormalize(className) {
        const trimmed = String(className || "").trim().replace(/\s+/g, " ");
        if (!trimmed) {
            throw new Error("Class name is required.");
        }
        if (!CLASS_NAME_REGEX.test(trimmed)) {
            throw new Error("Class names may contain only letters, numbers, and spaces.");
        }
        return {
            originalName: trimmed,
            normalizedName: normalizeClassName(trimmed),
        };
    }

    async ensureIndexes() {
        await this.classes.createIndex({ normalizedName: 1 }, { unique: true });
    }

    async createClassIfNeeded(className) {
        const { originalName, normalizedName } = ClassProvider.validateAndNormalize(className);
        const existing = await this.classes.findOne({ normalizedName });
        if (existing) {
            return existing;
        }

        await this.classes.insertOne({
            name: originalName,
            normalizedName,
            createdAt: new Date(),
        });

        return this.classes.findOne({ normalizedName });
    }

    async getAllClasses() {
        return this.classes.find({}, { projection: { normalizedName: 0 } }).sort({ name: 1 }).toArray();
    }
}
