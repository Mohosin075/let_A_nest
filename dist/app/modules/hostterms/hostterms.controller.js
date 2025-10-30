"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HosttermsController = void 0;
const hostterms_service_1 = require("./hostterms.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const hostterms_constants_1 = require("./hostterms.constants");
const pagination_1 = require("../../../interfaces/pagination");
const createHostterms = (0, catchAsync_1.default)(async (req, res) => {
    const hosttermsData = req.body;
    const result = await hostterms_service_1.HosttermsServices.createHostterms(req.user, hosttermsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Hostterms created successfully',
        data: result,
    });
});
const updateHostterms = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const hosttermsData = req.body;
    const result = await hostterms_service_1.HosttermsServices.updateHostterms(req.user, id, hosttermsData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Hostterms updated successfully',
        data: result,
    });
});
const getSingleHostterms = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await hostterms_service_1.HosttermsServices.getSingleHostterms(id, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Hostterms retrieved successfully',
        data: result,
    });
});
const getHostDefaultTerms = (0, catchAsync_1.default)(async (req, res) => {
    const result = await hostterms_service_1.HosttermsServices.getHostDefaultTerms(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Hostterms retrieved successfully',
        data: result,
    });
});
const getAllHosttermss = (0, catchAsync_1.default)(async (req, res) => {
    const filterables = (0, pick_1.default)(req.query, hostterms_constants_1.hosttermsFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await hostterms_service_1.HosttermsServices.getAllHosttermss(req.user, filterables, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Hosttermss retrieved successfully',
        data: result,
    });
});
const deleteHostterms = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await hostterms_service_1.HosttermsServices.deleteHostterms(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Hostterms deleted successfully',
        data: result,
    });
});
exports.HosttermsController = {
    createHostterms,
    updateHostterms,
    getSingleHostterms,
    getAllHosttermss,
    deleteHostterms,
    getHostDefaultTerms,
};
