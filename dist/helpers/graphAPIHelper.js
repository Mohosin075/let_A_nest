"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangeForLongLivedToken = exchangeForLongLivedToken;
exports.validateFacebookToken = validateFacebookToken;
exports.getFacebookUser = getFacebookUser;
exports.getFacebookPages = getFacebookPages;
exports.postToFacebookPage = postToFacebookPage;
exports.scheduleFacebookPost = scheduleFacebookPost;
exports.deleteFacebookPost = deleteFacebookPost;
exports.uploadFacebookPhoto = uploadFacebookPhoto;
exports.getFacebookVideoFullDetails = getFacebookVideoFullDetails;
exports.getAllPageVideoStats = getAllPageVideoStats;
exports.createInstagramImage = createInstagramImage;
exports.createInstagramStory = createInstagramStory;
exports.publishInstagramMedia = publishInstagramMedia;
exports.scheduleInstagramPost = scheduleInstagramPost;
exports.createInstagramReel = createInstagramReel;
exports.createInstagramCarousel = createInstagramCarousel;
exports.getInstagramPostInsights = getInstagramPostInsights;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
async function exchangeForLongLivedToken(shortLivedToken, appId, appSecret) {
    const url = new URL(`https://graph.facebook.com/v23.0/oauth/access_token`);
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', shortLivedToken);
    const res = await (0, node_fetch_1.default)(url.toString(), { method: 'GET' });
    const data = await res.json();
    if (data.error) {
        console.error('Facebook Token Exchange Error:', data.error);
        throw new Error(data.error.message);
    }
    return {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in, // usually 60 days in seconds
    };
}
async function validateFacebookToken(inputToken) {
    const appId = config_1.default.facebook.app_id;
    const appSecret = config_1.default.facebook.app_secret;
    const url = `https://graph.facebook.com/v23.0/debug_token?input_token=${inputToken}&access_token=${appId}|${appSecret}`;
    const res = await (0, node_fetch_1.default)(url);
    const result = await res.json();
    // This is the actual token info object
    const tokenInfo = result.data;
    if (!tokenInfo.is_valid) {
        // return tokenInfo.is_valid
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Facebook token expired');
    }
    return tokenInfo.is_valid; // { is_valid, expires_at, scopes, user_id, ... }
}
// ----------------------
// Facebook Functions
// ----------------------
async function getFacebookUser(accessToken) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data;
}
async function getFacebookPages(accessToken) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`);
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.data.map((p) => {
        var _a;
        return ({
            pageId: p.id,
            pageName: p.name,
            pageAccessToken: p.access_token,
            instagramBusinessId: ((_a = p.instagram_business_account) === null || _a === void 0 ? void 0 : _a.id) || null,
        });
    });
}
async function postToFacebookPage(pageId, pageAccessToken, message) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, access_token: pageAccessToken }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data;
}
async function scheduleFacebookPost(pageId, pageAccessToken, message, publishTime // UNIX timestamp
) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            published: false,
            scheduled_publish_time: publishTime,
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data;
}
async function deleteFacebookPost(postId, pageAccessToken) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${postId}?access_token=${pageAccessToken}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data;
}
async function uploadFacebookPhoto(pageId, pageAccessToken, imageUrl) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: imageUrl,
            published: false,
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
async function getFacebookVideoFullDetails(videoId, pageAccessToken) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const fields = [
        // Core video meta
        'id',
        'description',
        'permalink_url',
        'created_time',
        'updated_time',
        'length',
        'content_category',
        'source',
        'embeddable',
        'published',
        'privacy',
        'status',
        'thumbnails',
        // Engagement stats
        'likes.summary(true)',
        'comments.summary(true)',
        'video_insights.metric(total_video_impressions,total_video_views,total_video_10s_views,post_video_avg_time_watched)',
    ].join(',');
    const url = `https://graph.facebook.com/v21.0/${videoId}?fields=${fields}&access_token=${pageAccessToken}`;
    const res = await (0, node_fetch_1.default)(url);
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`FB API error: ${res.status} – ${errText}`);
    }
    const data = await res.json();
    // Optional: flatten some nested objects for easier DB storage
    return {
        id: data.id,
        description: data.description,
        permalink: data.permalink_url,
        createdAt: data.created_time,
        updatedAt: data.updated_time,
        durationSec: data.length,
        category: data.content_category,
        videoUrl: data.source,
        embeddable: data.embeddable,
        published: data.published,
        privacy: (_a = data.privacy) === null || _a === void 0 ? void 0 : _a.value,
        status: (_b = data.status) === null || _b === void 0 ? void 0 : _b.video_status,
        thumbnails: (_d = (_c = data.thumbnails) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : [],
        likesCount: (_g = (_f = (_e = data.likes) === null || _e === void 0 ? void 0 : _e.summary) === null || _f === void 0 ? void 0 : _f.total_count) !== null && _g !== void 0 ? _g : 0,
        commentsCount: (_k = (_j = (_h = data.comments) === null || _h === void 0 ? void 0 : _h.summary) === null || _j === void 0 ? void 0 : _j.total_count) !== null && _k !== void 0 ? _k : 0,
        // Insights array comes back nested—map it to key/value
        insights: ((_m = (_l = data.video_insights) === null || _l === void 0 ? void 0 : _l.data) !== null && _m !== void 0 ? _m : []).reduce((acc, item) => {
            var _a, _b;
            return ({
                ...acc,
                [item.name]: (_b = (_a = item.values) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value,
            });
        }, {}),
        // raw: data // keep full payload if you need it later
    };
}
async function getAllPageVideoStats(pageId, pageAccessToken) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    // 1️⃣ Fetch the page feed
    const feedUrl = `https://graph.facebook.com/v23.0/${pageId}/feed?fields=id,attachments{media_type,target,url},created_time,updated_time&access_token=${pageAccessToken}`;
    const feedRes = await (0, node_fetch_1.default)(feedUrl);
    if (!feedRes.ok)
        throw new Error(`Failed to fetch page feed: ${feedRes.statusText}`);
    const feedData = await feedRes.json();
    const results = [];
    for (const post of feedData.data) {
        const attachment = (_b = (_a = post.attachments) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b[0];
        if (!attachment || attachment.media_type !== 'video')
            continue;
        const videoId = (_c = attachment.target) === null || _c === void 0 ? void 0 : _c.id;
        if (!videoId)
            continue;
        // 2️⃣ Fetch video node for full details (description, videoUrl, duration)
        const videoRes = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${videoId}?fields=description,source,length&access_token=${pageAccessToken}`);
        const videoData = await videoRes.json();
        const description = (_d = videoData.description) !== null && _d !== void 0 ? _d : null;
        const videoUrl = (_e = videoData.source) !== null && _e !== void 0 ? _e : '';
        const durationSec = (_f = videoData.length) !== null && _f !== void 0 ? _f : 0;
        // 3️⃣ Fetch post-level likes/comments
        const postRes = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${post.id}?fields=likes.summary(true),comments.summary(true)&access_token=${pageAccessToken}`);
        const postData = await postRes.json();
        const likesCount = (_j = (_h = (_g = postData.likes) === null || _g === void 0 ? void 0 : _g.summary) === null || _h === void 0 ? void 0 : _h.total_count) !== null && _j !== void 0 ? _j : 0;
        const commentsCount = (_m = (_l = (_k = postData.comments) === null || _k === void 0 ? void 0 : _k.summary) === null || _l === void 0 ? void 0 : _l.total_count) !== null && _m !== void 0 ? _m : 0;
        // 4️⃣ Fetch video insights
        const metricsList = [
            'total_video_views',
            'total_video_impressions',
            'total_video_10s_views',
            'total_video_15s_views',
            'total_video_30s_views',
            'total_video_complete_views',
            'post_video_avg_time_watched',
        ].join(',');
        const insightsRes = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${videoId}/video_insights?metric=${metricsList}&access_token=${pageAccessToken}`);
        const insightsData = await insightsRes.json();
        const metrics = {};
        for (const m of insightsData.data || []) {
            metrics[m.name] = Number((_q = (_p = (_o = m.values) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.value) !== null && _q !== void 0 ? _q : 0);
        }
        results.push({
            id: videoId,
            description,
            permalink: `https://www.facebook.com/${pageId}/videos/${videoId}`,
            createdAt: post.created_time,
            updatedAt: post.updated_time,
            durationSec,
            videoUrl,
            likesCount,
            commentsCount,
            insights: metrics,
        });
    }
    return results;
}
// ----------------------
// Instagram Functions
// ----------------------
async function createInstagramImage(igBusinessId, pageAccessToken, imageUrl, caption) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igBusinessId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            media_type: 'IMAGE',
            image_url: imageUrl,
            caption: caption || '',
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
async function createInstagramStory(igBusinessId, pageAccessToken, mediaUrl, type, caption) {
    const body = { media_type: type, access_token: pageAccessToken };
    if (type === 'IMAGE')
        body.image_url = mediaUrl;
    else
        body.video_url = mediaUrl;
    if (caption)
        body.caption = caption;
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igBusinessId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
async function publishInstagramMedia(igBusinessId, pageAccessToken, creationId) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igBusinessId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            creation_id: creationId,
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
async function scheduleInstagramPost(igBusinessId, pageAccessToken, creationId, publishTime) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igBusinessId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            creation_id: creationId,
            publish_at: publishTime,
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
async function createInstagramReel(igBusinessId, pageAccessToken, videoUrl, caption) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igBusinessId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            media_type: 'REELS',
            video_url: videoUrl,
            caption,
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
async function createInstagramCarousel(igBusinessId, pageAccessToken, mediaUrls, captions) {
    const creationIds = [];
    for (let i = 0; i < mediaUrls.length; i++) {
        const id = await createInstagramImage(igBusinessId, pageAccessToken, mediaUrls[i], captions === null || captions === void 0 ? void 0 : captions[i]);
        creationIds.push(id);
    }
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igBusinessId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            media_type: 'CAROUSEL',
            children: creationIds,
            access_token: pageAccessToken,
        }),
    });
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data.id;
}
// not completed
async function getInstagramPostInsights(igMediaId, pageAccessToken) {
    const res = await (0, node_fetch_1.default)(`https://graph.facebook.com/v23.0/${igMediaId}?fields=like_count,comments_count,impressions,reach,engagement&access_token=${pageAccessToken}`);
    const data = await res.json();
    if (data.error)
        throw new Error(data.error.message);
    return data;
}
