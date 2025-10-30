"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const property_controller_1 = require("./property.controller");
const property_validation_1 = require("./property.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const fileUploadHandler_1 = __importDefault(require("../../middleware/fileUploadHandler"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const s3helper_1 = require("../../../helpers/image/s3helper");
const router = express_1.default.Router();
const handleImageUpload = async (req, res, next) => {
    var _a, _b;
    try {
        const payload = req.body;
        // Grab both sets of files from Multer
        const photoFiles = (_a = req.files) === null || _a === void 0 ? void 0 : _a.photos;
        const coverPhotoFiles = (_b = req.files) === null || _b === void 0 ? void 0 : _b.coverPhotos;
        // Upload photos (gallery images)
        let uploadedPhotos = [];
        if (photoFiles && photoFiles.length > 0) {
            uploadedPhotos = await s3helper_1.S3Helper.uploadMultipleFilesToS3(photoFiles, 'image');
            if (!uploadedPhotos.length) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload photos');
            }
        }
        // Upload cover photos (separate field)
        let uploadedCoverPhotos = [];
        if (coverPhotoFiles && coverPhotoFiles.length > 0) {
            uploadedCoverPhotos = await s3helper_1.S3Helper.uploadMultipleFilesToS3(coverPhotoFiles, 'image');
            if (!uploadedCoverPhotos.length) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload cover photos');
            }
        }
        // ✅ Merge results back into req.body
        req.body = {
            ...payload,
            ...(uploadedPhotos.length ? { photos: uploadedPhotos } : {}),
            ...(uploadedCoverPhotos.length
                ? { coverPhotos: uploadedCoverPhotos }
                : {}),
        };
        next();
    }
    catch (error) {
        console.error({ error });
        return res.status(400).json({ message: 'Failed to upload image(s)' });
    }
};
const handleDocUpload = async (req, res, next) => {
    const payload = req.body;
    try {
        const docFiles = req.files.doc;
        if (!docFiles || docFiles.length === 0) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No document file provided');
        }
        // Take the first file only
        const docFile = docFiles;
        console.log(docFile);
        // Upload single doc to S3
        const uploadedDocUrl = await s3helper_1.S3Helper.uploadMultipleFilesToS3(docFile, 'pdf');
        if (!uploadedDocUrl) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload document');
        }
        req.body = {
            ...payload,
            addressProofDocument: uploadedDocUrl, // Store as array
        };
        next();
    }
    catch (err) {
        res.status(400).json({ message: 'Failed to upload doc' });
    }
};
// Auth roles used everywhere
const roles = [user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST];
// /api/v1/properties
router
    .route('/')
    .get((0, auth_1.default)(...roles), property_controller_1.PropertyController.getAllProperties)
    .post((0, auth_1.default)(...roles), (0, validateRequest_1.default)(property_validation_1.PropertyValidations.create), property_controller_1.PropertyController.createProperty);
router.route('/add-bank-account').patch((0, auth_1.default)(user_1.USER_ROLES.HOST), property_controller_1.PropertyController.addHostBankAccount);
router
    .route('/upload-property-doc/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.HOST), (0, fileUploadHandler_1.default)(), handleDocUpload, property_controller_1.PropertyController.verifyPropertyAddress);
// /api/v1/properties/:id
router
    .route('/:id')
    .get((0, auth_1.default)(...roles), property_controller_1.PropertyController.getSingleProperty)
    .patch((0, auth_1.default)(...roles), (0, validateRequest_1.default)(property_validation_1.PropertyValidations.update), property_controller_1.PropertyController.updateProperty)
    .delete((0, auth_1.default)(...roles), property_controller_1.PropertyController.deleteProperty);
// /api/v1/properties/:id/images
router.route('/:id/images').patch((0, auth_1.default)(...roles), (0, fileUploadHandler_1.default)(), handleImageUpload, property_controller_1.PropertyController.updatePropertyImages);
exports.PropertyRoutes = router;
