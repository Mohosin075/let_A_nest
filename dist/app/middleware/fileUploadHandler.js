"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const fileUploadHandler = () => {
    // 1️⃣ Storage in memory for easy Sharp processing
    const storage = multer_1.default.memoryStorage();
    // 2️⃣ File filter
    const filterFilter = async (req, file, cb) => {
        try {
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const allowedMediaTypes = ['video/mp4', 'audio/mpeg'];
            const allowedDocTypes = ['application/pdf'];
            // ✅ All image-type fields (including your new ones)
            const imageFields = [
                'image',
                'license',
                'signature',
                'businessProfile',
                'photos',
                'coverPhotos',
            ];
            if (imageFields.includes(file.fieldname)) {
                if (allowedImageTypes.includes(file.mimetype))
                    return cb(null, true);
                return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg files are supported'));
            }
            if (file.fieldname === 'media' || file.fieldname === 'clips') {
                if (allowedMediaTypes.includes(file.mimetype))
                    return cb(null, true);
                return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .mp4, .mp3 files are supported'));
            }
            if (file.fieldname === 'doc') {
                if (allowedDocTypes.includes(file.mimetype))
                    return cb(null, true);
                return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Only .pdf is supported'));
            }
            return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'This file field is not supported'));
        }
        catch (_a) {
            cb(new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'File validation failed'));
        }
    };
    // 3️⃣ Multer setup with new fields
    const upload = (0, multer_1.default)({
        storage,
        fileFilter: filterFilter,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB per file
            files: 20, // total max
        },
    }).fields([
        { name: 'image', maxCount: 5 },
        { name: 'photos', maxCount: 10 }, // 🆕 multiple gallery photos
        { name: 'coverPhotos', maxCount: 3 }, // 🆕 cover images
        { name: 'media', maxCount: 3 },
        { name: 'doc', maxCount: 3 },
        { name: 'clips', maxCount: 3 },
    ]);
    // 4️⃣ Sharp image optimization
    const processImages = async (req, res, next) => {
        if (!req.files)
            return next();
        try {
            const imageFields = [
                'image',
                'license',
                'signature',
                'businessProfile',
                'photos',
                'coverPhotos',
            ];
            for (const field of imageFields) {
                const files = req.files[field];
                if (!files)
                    continue;
                for (const file of files) {
                    if (!file.mimetype.startsWith('image'))
                        continue;
                    // Resize & compress (keeps aspect ratio)
                    const optimizedBuffer = await (0, sharp_1.default)(file.buffer)
                        .resize({ width: 1024 })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                    file.buffer = optimizedBuffer;
                }
            }
            next();
        }
        catch (_a) {
            next(new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Image processing failed'));
        }
    };
    // 5️⃣ Combined middleware
    return (req, res, next) => {
        upload(req, res, err => {
            if (err)
                return next(err);
            processImages(req, res, next);
        });
    };
};
exports.default = fileUploadHandler;
