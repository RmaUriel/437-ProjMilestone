import multer from "multer";
import path from "path";
import { getEnvVar } from "./getEnvVar.js";

class ImageFormatError extends Error {}

const IMAGE_UPLOAD_DIR = getEnvVar("IMAGE_UPLOAD_DIR") || "uploads";

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, IMAGE_UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const mimetype = String(file.mimetype || "");
        let ext = "";
        if (mimetype === "image/png") {
            ext = "png";
        } else if (mimetype === "image/jpg" || mimetype === "image/jpeg") {
            ext = "jpg";
        } else {
            cb(new ImageFormatError("Unsupported image type"));
            return;
        }

        const fileName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + ext;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err, req, res, next) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}