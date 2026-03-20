import { getEnvVar } from "./getEnvVar.js";
import { ObjectId } from "mongodb";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.images = this.mongoClient
            .db()
            .collection(getEnvVar("IMAGES_COLLECTION_NAME"));
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
    }

    async getOneImage(imageId) {
        const objectId = new ObjectId(imageId);

        const pipeline = [
            { $match: { _id: objectId } },
            {
                $lookup: {
                    from: this.usersCollectionName,
                    localField: "authorId",
                    foreignField: "username",
                    as: "author",
                },
            },
            {
                $unwind: {
                    path: "$author",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const results = await this.images.aggregate(pipeline).toArray();
        return results[0] || null;
    }

    getAllImages() {
        const pipeline = [];

        pipeline.push({
            $lookup: {
                from: this.usersCollectionName,
                localField: "authorId",
                foreignField: "username",
                as: "author",
            },
        });

        pipeline.push({
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true,
            },
        });

        return this.images.aggregate(pipeline).toArray();
    }

    async updateImageName(imageId, newName) {
        const objectId = new ObjectId(imageId);

        const result = await this.images.updateOne(
            { _id: objectId },
            { $set: { name: newName } }
        );

        return result.matchedCount;
    }

    async createImage(imageDoc) {
        const insertResult = await this.images.insertOne({
            src: imageDoc.src,
            name: imageDoc.name,
            authorId: imageDoc.authorId
        });
        return String(insertResult.insertedId);
    }


}