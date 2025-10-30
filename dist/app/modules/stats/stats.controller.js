"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const stats_service_1 = require("./stats.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const stats_constants_1 = require("./stats.constants");
const pagination_1 = require("../../../interfaces/pagination");
const getSingleStats = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await stats_service_1.StatsServices.getSingleStats(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Stats retrieved successfully',
        data: result,
    });
});
const getAllStatss = (0, catchAsync_1.default)(async (req, res) => {
    const filterables = (0, pick_1.default)(req.query, stats_constants_1.statsFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await stats_service_1.StatsServices.getAllStatss(req.user, filterables, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Statss retrieved successfully',
        data: result,
    });
});
exports.StatsController = {
    getSingleStats,
    getAllStatss,
};
