"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndIncrementUsage = void 0;
const subscription_model_1 = require("./subscription.model");
const uuid_1 = require("uuid");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const plan_model_1 = require("../plan/plan.model");
const checkAndIncrementUsage = async (user, type, session = null // default to null
) => {
    const paid_subscription = await subscription_model_1.Subscription.findOne({
        user: user.authId,
        status: 'active',
    })
        .populate('plan')
        .session(session); // session can be null
    const plan = await plan_model_1.Plan.findOne({ price: 0, status: 'active' }).session(session);
    if (!plan) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No Free Plan is currently available. Please consider upgrading to a Pro Plan to continue.');
    }
    const now = new Date();
    const currentPeriodStart = now.toISOString();
    const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
    const subscriptionPayload = {
        customerId: `cus_${(0, uuid_1.v4)()}`,
        subscriptionId: `sub_${(0, uuid_1.v4)()}`,
        price: 0,
        plan: plan === null || plan === void 0 ? void 0 : plan._id,
        user: user.authId,
        currentPeriodStart,
        currentPeriodEnd,
    };
    if (!paid_subscription || !paid_subscription.plan) {
        await subscription_model_1.Subscription.create([subscriptionPayload], { session });
    }
    const subscription = await subscription_model_1.Subscription.findOne({
        user: user.authId,
        status: 'active',
    })
        .populate('plan')
        .session(session);
    if (!subscription || !subscription.plan) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No Subscription found.');
    }
    const usageMap = {
        reels: 'reelsUsed',
        post: 'postsUsed',
        story: 'storiesUsed',
        carousel: 'carouselUsed',
    };
    const limitMap = {
        reels: 'reelsPerWeek',
        post: 'postsPerWeek',
        story: 'storiesPerWeek',
        carousel: 'carouselPerWeek',
    };
    const usageKey = usageMap[type];
    const limitKey = limitMap[type];
    const used = subscription.usage[usageKey];
    const limit = subscription.plan.limits[limitKey];
    if (used >= limit) {
        throw new Error(`Limit reached for ${type}. Please upgrade.`);
    }
    // Atomic increment using findByIdAndUpdate
    await subscription_model_1.Subscription.findByIdAndUpdate(subscription._id, { $inc: { [usageKey]: 1 } }, { session });
    return {
        subscriptionId: subscription._id,
        type,
        used: used + 1,
        limit,
    };
};
exports.checkAndIncrementUsage = checkAndIncrementUsage;
