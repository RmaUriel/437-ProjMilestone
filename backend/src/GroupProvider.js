import { ObjectId } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";
import { ClassProvider } from "./ClassProvider.js";

const MAX_GROUP_SIZE = 10;

export class GroupProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.groups = this.mongoClient
            .db()
            .collection(getEnvVar("GROUPS_COLLECTION_NAME") || "groups");
        this.classes = this.mongoClient
            .db()
            .collection(getEnvVar("CLASSES_COLLECTION_NAME") || "classes");
    }

    async ensureIndexes() {
        await this.groups.createIndex({ classNormalizedName: 1 });
    }

    async getAllGroups() {
        const pipeline = [
            {
                $lookup: {
                    from: getEnvVar("USERS_COLLECTION_NAME"),
                    localField: "members",
                    foreignField: "username",
                    as: "memberProfiles",
                },
            },
            {
                $project: {
                    _id: 1,
                    className: 1,
                    classNormalizedName: 1,
                    groupName: 1,
                    meeting: 1,
                    groupBio: 1,
                    createdBy: 1,
                    members: 1,
                    memberCount: { $size: "$members" },
                    memberProfiles: {
                        $map: {
                            input: "$memberProfiles",
                            as: "member",
                            in: {
                                username: "$$member.username",
                                firstName: "$$member.firstName",
                                lastName: "$$member.lastName",
                                bio: "$$member.bio",
                                major: "$$member.major",
                                year: "$$member.year",
                                profileImageUrl: "$$member.profileImageUrl",
                            },
                        },
                    },
                },
            },
            {
                $sort: {
                    className: 1,
                    groupName: 1,
                },
            },
        ];

        const groups = await this.groups.aggregate(pipeline).toArray();
        return groups.map((group) => ({
            ...group,
            id: String(group._id),
        }));
    }

    async createGroup({ className, groupName, meeting, groupBio, creatorUsername }) {
        const { normalizedName } = ClassProvider.validateAndNormalize(className);
        const classRecord = await this.classes.findOne({ normalizedName });

        if (!classRecord) {
            throw new Error("Class must exist before creating a group.");
        }

        const cleanGroupName = String(groupName || "").trim();
        if (!cleanGroupName) {
            throw new Error("Group name is required.");
        }


        await this.groups.insertOne({
            className: classRecord.name,
            classNormalizedName: classRecord.normalizedName,
            groupName: cleanGroupName,
            meeting: String(meeting || "TBD").trim() || "TBD",
            groupBio: String(groupBio || "").trim(),
            createdBy: creatorUsername,
            members: [creatorUsername],
            createdAt: new Date(),
        });


        return this.getAllGroups();
    }

    async updateGroup(groupId, username, updates) {
        const objectId = new ObjectId(groupId);
        const group = await this.groups.findOne({ _id: objectId });
        if (!group) {
            throw new Error("Group not found.");
        }

        if (String(group.createdBy || "").toLowerCase() !== String(username || "").trim().toLowerCase()) {
            throw new Error("Only the group creator can update this group.");
        }

        const updateDoc = {};

        if (Object.prototype.hasOwnProperty.call(updates, "className")) {
            const { normalizedName } = ClassProvider.validateAndNormalize(updates.className);
            const classRecord = await this.classes.findOne({ normalizedName });
            if (!classRecord) {
                throw new Error("Class must exist before updating a group.");
            }
            updateDoc.className = classRecord.name;
            updateDoc.classNormalizedName = classRecord.normalizedName;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "groupName")) {
            const cleanGroupName = String(updates.groupName || "").trim();
            if (!cleanGroupName) {
                throw new Error("Group name is required.");
            }
            updateDoc.groupName = cleanGroupName;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "meeting")) {
            updateDoc.meeting = String(updates.meeting || "TBD").trim() || "TBD";
        }

        if (Object.prototype.hasOwnProperty.call(updates, "groupBio")) {
            updateDoc.groupBio = String(updates.groupBio || "").trim();
        }

        await this.groups.updateOne(
            { _id: objectId },
            {
                $set: updateDoc,
            }
        );

        return this.getAllGroups();

    }

    async joinGroup(groupId, username) {
        const objectId = new ObjectId(groupId);
        const group = await this.groups.findOne({ _id: objectId });
        if (!group) {
            throw new Error("Group not found.");
        }
        if (group.members.includes(username)) {
            return this.getAllGroups();
        }
        if (group.members.length >= MAX_GROUP_SIZE) {
            throw new Error("This group already has 10 students.");
        }

        await this.groups.updateOne(
            { _id: objectId },
            { $addToSet: { members: username } }
        );

        return this.getAllGroups();
    }

    async leaveGroup(groupId, username) {
        const objectId = new ObjectId(groupId);
        const group = await this.groups.findOne({ _id: objectId });
        if (!group) {
            throw new Error("Group not found.");
        }

        await this.groups.updateOne(
            { _id: objectId },
            { $pull: { members: username } }
        );


        const updatedGroup = await this.groups.findOne({ _id: objectId });
        if (updatedGroup && (updatedGroup.members || []).length === 0) {
            await this.groups.deleteOne({ _id: objectId });
        }

        return this.getAllGroups();
    }
}
