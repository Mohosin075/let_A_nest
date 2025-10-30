"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const property_service_1 = require("./property.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const property_constants_1 = require("./property.constants");
const pagination_1 = require("../../../interfaces/pagination");
const createProperty = (0, catchAsync_1.default)(async (req, res) => {
    const propertyData = req.body;
    const result = await property_service_1.PropertyServices.createProperty(req.user, propertyData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Property created successfully',
        data: result,
    });
});
const updateProperty = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const propertyData = req.body;
    const result = await property_service_1.PropertyServices.updateProperty(id, req.user, propertyData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Property updated successfully',
        data: result,
    });
});
const updatePropertyImages = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const propertyData = req.body;
    const result = await property_service_1.PropertyServices.updatePropertyImages(id, propertyData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Property updated successfully',
        data: result,
    });
});
const getSingleProperty = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await property_service_1.PropertyServices.getSingleProperty(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Property retrieved successfully',
        data: result,
    });
});
const getAllProperties = (0, catchAsync_1.default)(async (req, res) => {
    const filterables = (0, pick_1.default)(req.query, property_constants_1.propertyFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    // Normalize amenities for comma-separated values
    if (filterables.amenities && typeof filterables.amenities === 'string') {
        filterables.amenities = filterables.amenities.split(',').map(a => a.trim());
    }
    const result = await property_service_1.PropertyServices.getAllPropertys(req.user, filterables, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Properties retrieved successfully',
        data: result,
    });
});
const deleteProperty = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await property_service_1.PropertyServices.deleteProperty(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Property deleted successfully',
        data: result,
    });
});
const addHostBankAccount = (0, catchAsync_1.default)(async (req, res) => {
    const result = await property_service_1.PropertyServices.addHostBankAccount(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Bank account added successfully',
        data: result,
    });
});
const verifyPropertyAddress = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    // console.log(payload)
    const result = await property_service_1.PropertyServices.verifyPropertyAddress(id, req.user, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Property docs uploaded successfully',
        data: result,
    });
});
exports.PropertyController = {
    createProperty,
    updateProperty,
    getSingleProperty,
    getAllProperties,
    deleteProperty,
    updatePropertyImages,
    addHostBankAccount,
    verifyPropertyAddress,
};
