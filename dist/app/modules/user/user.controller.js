"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_service_1 = require("./user.service");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../interfaces/pagination");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const updateProfile = (0, catchAsync_1.default)(async (req, res) => {
    const { imageUrl, ...userData } = req.body;
    imageUrl && (userData.profile = imageUrl);
    const result = await user_service_1.UserServices.updateProfile(req.user, userData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    });
});
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await user_service_1.UserServices.getAllUsers(paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});
const deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await user_service_1.UserServices.deleteUser(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
});
const deleteProfile = (0, catchAsync_1.default)(async (req, res) => {
    const user = req.user;
    const { password } = req.body;
    if (!password) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Password is required');
    }
    const result = await user_service_1.UserServices.deleteProfile(user.authId, password);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User profile deleted successfully',
        data: result,
    });
});
const getUserById = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await user_service_1.UserServices.getUserById(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});
const updateUserStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    const result = await user_service_1.UserServices.updateUserStatus(userId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User status updated successfully',
        data: result,
    });
});
const getProfile = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserServices.getProfile(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: result,
    });
});
exports.UserController = {
    updateProfile,
    getAllUsers,
    deleteUser,
    getUserById,
    updateUserStatus,
    getProfile,
    deleteProfile,
};
