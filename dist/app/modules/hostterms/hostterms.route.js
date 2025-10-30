"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HosttermsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const hostterms_controller_1 = require("./hostterms.controller");
const hostterms_validation_1 = require("./hostterms.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const router = express_1.default.Router();
// /hostterms/
router
    .route('/')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST), hostterms_controller_1.HosttermsController.getAllHosttermss)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST), (0, validateRequest_1.default)(hostterms_validation_1.HosttermsValidations.create), hostterms_controller_1.HosttermsController.createHostterms);
router
    .route('/default')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST, user_1.USER_ROLES.GUEST), hostterms_controller_1.HosttermsController.getHostDefaultTerms);
// /hostterms/:id
router
    .route('/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST, user_1.USER_ROLES.GUEST), hostterms_controller_1.HosttermsController.getSingleHostterms)
    .patch((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST), (0, validateRequest_1.default)(hostterms_validation_1.HosttermsValidations.update), hostterms_controller_1.HosttermsController.updateHostterms)
    .delete((0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.HOST), hostterms_controller_1.HosttermsController.deleteHostterms);
exports.HosttermsRoutes = router;
