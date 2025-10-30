"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const user_model_1 = require("../../../user/user.model");
const passport_local_1 = require("passport-local");
const user_1 = require("../../../../../enum/user");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const FacebookStrategy = require('passport-facebook').Strategy;
const config_1 = __importDefault(require("../../../../../config"));
const ApiError_1 = __importDefault(require("../../../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req, email, password, done) => {
    try {
        const isUserExist = await user_model_1.User.findOne({
            email,
            status: { $in: [user_1.USER_STATUS.ACTIVE, user_1.USER_STATUS.INACTIVE] },
        })
            .select('+password +authentication')
            .lean();
        if (!isUserExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No account found with this email, please try with valid email or create an account.');
        }
        return done(null, {
            ...isUserExist,
        });
    }
    catch (err) {
        return done(err);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.default.google.client_id,
    clientSecret: config_1.default.google.client_secret,
    callbackURL: config_1.default.google.callback_url,
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    req.body.profile = profile;
    req.body.role = user_1.USER_ROLES.GUEST;
    try {
        return done(null, req.body);
    }
    catch (err) {
        return done(err);
    }
}));
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: config.facebook.app_id!,
//       clientSecret: config.facebook.app_secret!,
//       callbackURL: config.facebook.callback_url,
//       profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
//       passReqToCallback: true,
//     },
//     async (
//       req: any,
//       accessToken: string,
//       refreshToken: string,
//       profile: any,
//       done: any,
//     ) => {
//       try {
//         console.log(req.user)
//         // Check if user exists
//         let user = await User.findOne({ appId: profile.id })
//         const longLiveToken = await exchangeForLongLivedToken(
//           accessToken,
//           config.facebook.app_id!,
//           config.facebook.app_secret!,
//         )
//         // console.log({tokenInfo})
//         const payload = {
//           platform: 'facebook',
//           appId: profile.id,
//           accessToken: longLiveToken?.accessToken,
//           refreshToken,
//         }
//         let localAccessToken
//         let localRefreshToken
//         if (!user) {
//           // Create new user
//           user = new User({
//             appId: profile.id,
//             email: profile.emails?.[0]?.value,
//             name: profile.displayName,
//             profilePhoto: profile.photos?.[0]?.value,
//             accessToken,
//             refreshToken,
//             verified: true,
//           })
//           const savedUser = (await user.save())._id.toString()
//           await Socialintegration.create({
//             ...payload,
//             user: savedUser,
//           })
//           const localToken = await CustomAuthServices.socialLogin(
//             profile.id,
//             '',
//           )
//           localAccessToken = localToken.accessToken
//           localRefreshToken = localToken.refreshToken
//         } else {
//           // Update existing user
//           // user.accessToken = accessToken
//           // user.refreshToken = refreshToken
//           user.email = profile.emails?.[0]?.value || user.email
//           user.name = profile.displayName || user.name
//           user.appId = profile.id
//           // user.profilePhoto = profile.photos?.[0]?.value || user.profilePhoto
//           const savedUser = (await user.save())._id.toString()
//           const isSocialInegrationExist = await Socialintegration.findOne({
//             appId: profile.id,
//           })
//           if (!isSocialInegrationExist) {
//             await Socialintegration.create({
//               ...payload,
//               user: savedUser,
//             })
//           }
//           await Socialintegration.findOneAndUpdate(
//             {
//               appId: profile.id,
//             },
//             {
//               accessToken: longLiveToken?.accessToken,
//             },
//             {
//               new: true,
//             },
//           )
//           const localToken = await CustomAuthServices.socialLogin(
//             profile.id,
//             '',
//           )
//           localAccessToken = localToken.accessToken
//           localRefreshToken = localToken.refreshToken
//         }
//         return done(null, {
//           _id: user._id,
//           email: user.email,
//           name: user.name,
//           accessToken: localAccessToken, // add
//           refreshToken: localRefreshToken, // add
//         })
//       } catch (error) {
//         console.error('❌ Facebook strategy error:', error)
//         return done(error, null)
//       }
//     },
//   ),
// )
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
