"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_route_1 = require("../app/modules/user/user.route");
const auth_route_1 = require("../app/modules/auth/auth.route");
const express_1 = __importDefault(require("express"));
const notifications_route_1 = require("../app/modules/notifications/notifications.route");
const public_route_1 = require("../app/modules/public/public.route");
const plan_routes_1 = require("../app/modules/plan/plan.routes");
const subscription_routes_1 = require("../app/modules/subscription/subscription.routes");
const stats_route_1 = require("../app/modules/stats/stats.route");
const property_route_1 = require("../app/modules/property/property.route");
const hostterms_route_1 = require("../app/modules/hostterms/hostterms.route");
const router = express_1.default.Router();
const apiRoutes = [
    { path: '/user', route: user_route_1.UserRoutes },
    { path: '/auth', route: auth_route_1.AuthRoutes },
    { path: '/notifications', route: notifications_route_1.NotificationRoutes },
    { path: '/public', route: public_route_1.PublicRoutes },
    { path: '/plan', route: plan_routes_1.PlanRoutes },
    { path: '/subscription', route: subscription_routes_1.SubscriptionRoutes },
    { path: '/stats', route: stats_route_1.StatsRoutes },
    { path: '/property', route: property_route_1.PropertyRoutes },
    { path: '/hostterms', route: hostterms_route_1.HosttermsRoutes },
];
apiRoutes.forEach(route => {
    router.use(route.path, route.route);
});
exports.default = router;
