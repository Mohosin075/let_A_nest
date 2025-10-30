"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyServices = exports.verifyPropertyAddress = exports.getAllPropertys = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const property_model_1 = require("./property.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const property_constants_1 = require("./property.constants");
const mongoose_1 = require("mongoose");
const s3helper_1 = require("../../../helpers/image/s3helper");
const hostterms_model_1 = require("../hostterms/hostterms.model");
const createProperty = async (user, payload) => {
    try {
        const result = await property_model_1.Property.create({ ...payload, host: user.authId });
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Property, please try again with valid data.');
        }
        return result;
    }
    catch (error) {
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
};
const getAllPropertys = async (user, filterables, pagination) => {
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    /* ---------- 🔍 Global text search ---------- */
    if (searchTerm) {
        andConditions.push({
            $or: property_constants_1.propertySearchableFields.map(field => {
                const path = field === 'amenities' ? 'details.amenities' : field;
                return { [path]: { $regex: searchTerm, $options: 'i' } };
            }),
        });
    }
    /* ---------- 🎯 Structured / field filters ---------- */
    if (Object.keys(filterData).length) {
        const filters = [];
        for (const [key, rawVal] of Object.entries(filterData)) {
            const value = Array.isArray(rawVal) ? rawVal : [rawVal];
            switch (key) {
                case 'amenities':
                    // ✅ Case-insensitive match for all requested amenities
                    filters.push({
                        $and: value.map(v => ({
                            'details.amenities': { $regex: new RegExp(`^${v}$`, 'i') },
                        })),
                    });
                    break;
                case 'maxGuests':
                    filters.push({ 'details.maxGuests': { $gte: Number(value[0]) } });
                    break;
                case 'bedrooms':
                    filters.push({ 'details.bedrooms': { $gte: Number(value[0]) } });
                    break;
                case 'bathrooms':
                    filters.push({ 'details.bathrooms': { $gte: Number(value[0]) } });
                    break;
                case 'priceMin':
                case 'priceMax':
                    break; // handled after loop
                case 'from':
                case 'to':
                    break; // handled after loop for availability
                default:
                    // Top-level string fields, case-insensitive
                    filters.push({ [key]: { $regex: value[0], $options: 'i' } });
            }
        }
        /* ---------- 💰 Price range ---------- */
        const priceCond = {};
        if (filterData.priceMin !== undefined &&
            !isNaN(Number(filterData.priceMin))) {
            priceCond.$gte = Number(filterData.priceMin);
        }
        if (filterData.priceMax !== undefined &&
            !isNaN(Number(filterData.priceMax))) {
            priceCond.$lte = Number(filterData.priceMax);
        }
        if (Object.keys(priceCond).length > 0) {
            filters.push({ 'details.priceStartingFrom': priceCond });
        }
        /* ---------- 📅 Availability (from-to) ---------- */
        if (filterData.from && filterData.to) {
            const requestedFrom = new Date(filterData.from);
            const requestedTo = new Date(filterData.to);
            filters.push({
                $and: [
                    { 'details.availableDateRanges.from': { $lte: requestedFrom } },
                    { 'details.availableDateRanges.to': { $gte: requestedTo } },
                ],
            });
        }
        if (filters.length)
            andConditions.push({ $and: filters });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    /* ---------- 🚀 Query + count in parallel ---------- */
    const [result, total] = await Promise.all([
        property_model_1.Property.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({
            path: 'host',
            select: 'name email phoneNumber', // add/remove host fields as needed
        }),
        property_model_1.Property.countDocuments(whereConditions),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
exports.getAllPropertys = getAllPropertys;
const getSingleProperty = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Property ID');
    }
    const result = await property_model_1.Property.findById(id).populate('host');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested property not found, please try again with valid id');
    }
    return result;
};
const updateProperty = async (id, user, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Property ID');
    }
    // Update property with payload first
    let result = await property_model_1.Property.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: payload }, { new: true, runValidators: true }).populate('host');
    // Determine which host terms to use
    let hostTermsAndCondition;
    const hostTerms = await hostterms_model_1.Hostterms.findOne({
        hostId: user.authId,
        propertyId: id,
    });
    const defaultHostTerms = await hostterms_model_1.Hostterms.findOne({
        hostId: user.authId,
        isDefault: true,
    });
    hostTermsAndCondition = (hostTerms === null || hostTerms === void 0 ? void 0 : hostTerms._id) || (defaultHostTerms === null || defaultHostTerms === void 0 ? void 0 : defaultHostTerms._id);
    // If host agreed to terms, update property with terms reference
    if (hostTermsAndCondition) {
        result = await property_model_1.Property.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: { hostTermsAndCondition } }, // ✅ fixed: field mapping
        { new: true, runValidators: true }).populate('host');
    }
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested property not found, please try again with valid id');
    }
    return result;
};
const updatePropertyImages = async (id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Property ID');
    }
    const { photos, coverPhotos } = payload;
    if (!Array.isArray(photos) ||
        photos.length === 0 ||
        !Array.isArray(coverPhotos) ||
        coverPhotos.length === 0) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Both photos and coverPhotos must be non-empty arrays!');
    }
    // return
    const result = await property_model_1.Property.findByIdAndUpdate(new mongoose_1.Types.ObjectId(id), { $set: { photos, coverPhotos } }, {
        new: true,
        runValidators: true,
    }).populate('host');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested property not found, please try again with valid id');
    }
    return result;
};
const deleteProperty = async (id) => {
    var _a, _b;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Property ID');
    }
    // 1️⃣ Find the property first (so we know which files to remove)
    const property = await property_model_1.Property.findById(id);
    if (!property) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Property not found or already deleted.');
    }
    const fileKeys = [
        ...((_a = property.photos) !== null && _a !== void 0 ? _a : []),
        ...((_b = property.coverPhotos) !== null && _b !== void 0 ? _b : []),
    ];
    await Promise.all(fileKeys.map(key => s3helper_1.S3Helper.deleteFromS3(key)));
    // 4️⃣ Finally remove the property doc itself
    await property_model_1.Property.findByIdAndDelete(id);
    return property;
};
const addHostBankAccount = async (user) => {
    return user;
};
const verifyPropertyAddress = async (id, user, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Property ID');
    }
    const result = await property_model_1.Property.findOneAndUpdate({ _id: id, host: user.authId }, payload, { new: true, runValidators: true }).select('+addressProofDocument');
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Property not found! Provide a valid id.');
    }
    return result;
};
exports.verifyPropertyAddress = verifyPropertyAddress;
exports.PropertyServices = {
    createProperty,
    getAllPropertys: exports.getAllPropertys,
    getSingleProperty,
    updateProperty,
    updatePropertyImages,
    deleteProperty,
    addHostBankAccount,
    verifyPropertyAddress: exports.verifyPropertyAddress,
};
