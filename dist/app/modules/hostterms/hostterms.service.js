"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HosttermsServices = exports.updateHostterms = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const hostterms_model_1 = require("./hostterms.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const hostterms_constants_1 = require("./hostterms.constants");
const mongoose_1 = require("mongoose");
const property_model_1 = require("../property/property.model");
// for default terms
const createHostterms = async (user, payload) => {
    try {
        const filter = { hostId: user.authId, isDefault: true };
        // Check if terms already exist for this property
        let terms = await hostterms_model_1.Hostterms.findOne(filter);
        if (terms) {
            // Update and return the new document
            terms = await hostterms_model_1.Hostterms.findOneAndUpdate(filter, { ...payload, isDefault: true }, { new: true, runValidators: true });
            return terms;
        }
        // If not exist, create new terms
        const newTerms = await hostterms_model_1.Hostterms.create({
            ...payload,
            isDefault: true,
            hostId: user.authId,
        });
        return newTerms;
    }
    catch (error) {
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
};
const getAllHosttermss = async (user, filterables, pagination) => {
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: hostterms_constants_1.hosttermsSearchableFields.map(field => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }
    // Filter functionality
    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        hostterms_model_1.Hostterms.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate('hostId')
            .populate('propertyId'),
        hostterms_model_1.Hostterms.countDocuments(whereConditions),
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
const getHostDefaultTerms = async (user) => {
    const result = await hostterms_model_1.Hostterms.findOne({
        hostId: user.authId,
        isDefault: true,
    });
    return result;
};
const getSingleHostterms = async (id, user) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Hostterms ID');
    }
    let result;
    result = await hostterms_model_1.Hostterms.findOne({
        propertyId: id,
        hostId: user.authId,
    });
    if (!result) {
        result = await hostterms_model_1.Hostterms.findOne({
            hostId: user.authId,
        });
    }
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested hostterms not found, please try again with valid id');
    }
    return result;
};
// for property specific terms
const updateHostterms = async (user, propertyId, payload) => {
    try {
        const filter = { hostId: user.authId, propertyId: propertyId || null };
        const hostProperty = await property_model_1.Property.findOne({
            _id: propertyId,
            host: user.authId,
        });
        if (!hostProperty) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You do not own this property or it does not exist');
        }
        // Check if terms already exist for this property
        let terms = await hostterms_model_1.Hostterms.findOne(filter);
        if (terms) {
            // Update and return the new document
            terms = await hostterms_model_1.Hostterms.findOneAndUpdate(filter, { ...payload, propertyId }, { new: true, runValidators: true });
            return terms;
        }
        // If not exist, create new terms
        const newTerms = await hostterms_model_1.Hostterms.create({
            ...payload,
            hostId: user.authId,
            propertyId,
        });
        return newTerms;
    }
    catch (error) {
        if (error.code === 11000) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Duplicate entry found');
        }
        throw error;
    }
};
exports.updateHostterms = updateHostterms;
const deleteHostterms = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Hostterms ID');
    }
    const result = await hostterms_model_1.Hostterms.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting hostterms, please try again with valid id.');
    }
    return result;
};
exports.HosttermsServices = {
    createHostterms,
    getAllHosttermss,
    getSingleHostterms,
    updateHostterms: exports.updateHostterms,
    deleteHostterms,
    getHostDefaultTerms,
};
