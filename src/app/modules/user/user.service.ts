import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IUser } from './user.interface';
import { User } from './user.model';

import { USER_ROLES, USER_STATUS } from '../../../enum/user';

import { JwtPayload } from 'jsonwebtoken';
import { logger } from '../../../shared/logger';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { S3Helper } from '../../../helpers/image/s3helper';
import config from '../../../config';
import { Subscription } from '../subscription/subscription.model';
import { IPlan } from '../plan/plan.interface';

const updateProfile = async (user: JwtPayload, payload: Partial<IUser>) => {
  const isUserExist = await User.findOne({
    _id: user.authId,
    status: { $nin: [USER_STATUS.DELETED] },
  });

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (isUserExist.profile) {
    const url = new URL(isUserExist.profile);
    const key = url.pathname.substring(1);
    await S3Helper.deleteFromS3(key);
  }

  const updatedProfile = await User.findOneAndUpdate(
    { _id: user.authId, status: { $nin: [USER_STATUS.DELETED] } },
    {
      $set: payload,
    },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile.');
  }

  return 'Profile updated successfully.';
};

const createAdmin = async (): Promise<Partial<IUser> | null> => {
  const admin = {
    email: config.super_admin.email,
    name: config.super_admin.name,
    password: config.super_admin.password,
    role: USER_ROLES.SUPER_ADMIN,
    status: USER_STATUS.ACTIVE,
    verified: true,
    authentication: {
      oneTimeCode: null,
      restrictionLeftAt: null,
      expiresAt: null,
      latestRequestAt: new Date(),
      authType: 'createAccount',
    },
  };

  const isAdminExist = await User.findOne({
    email: admin.email,
    status: { $nin: [USER_STATUS.DELETED] },
  });

  if (isAdminExist) {
    logger.log('info', 'Admin account already exist, skipping creation.🦥');
    return isAdminExist;
  }
  const result = await User.create([admin]);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
  }
  return result[0];
};

const getAllUsers = async (paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const [result, total] = await Promise.all([
    User.find({ status: { $nin: [USER_STATUS.DELETED] } })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),

    User.countDocuments({ status: { $nin: [USER_STATUS.DELETED] } }),
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

const deleteUser = async (userId: string): Promise<string> => {
  const isUserExist = await User.findOne({
    _id: userId,
    status: { $nin: [USER_STATUS.DELETED] },
  });
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const deletedUser = await User.findOneAndUpdate(
    { _id: userId, status: { $nin: [USER_STATUS.DELETED] } },
    { $set: { status: USER_STATUS.DELETED } },
    { new: true }
  );

  if (!deletedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete user.');
  }

  return 'User deleted successfully.';
};

const deleteProfile = async (userId: string, password: string): Promise<string> => {
  const isUserExist = await User.findOne({
    _id: userId,
    status: { $nin: [USER_STATUS.DELETED] },
  }).select('+password');
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  const isPasswordMatched = await User.isPasswordMatched(password, isUserExist.password);

  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is incorrect.');
  }

  const deletedUser = await User.findOneAndUpdate(
    { _id: userId, status: { $nin: [USER_STATUS.DELETED] } },
    { $set: { status: USER_STATUS.DELETED } },
    { new: true }
  );

  if (!deletedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete user.');
  }

  return 'User deleted successfully.';
};

const getUserById = async (userId: string): Promise<IUser | null> => {
  const isUserExist = await User.findOne({
    _id: userId,
    status: { $nin: [USER_STATUS.DELETED] },
  });
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  const user = await User.findOne({
    _id: userId,
    status: { $nin: [USER_STATUS.DELETED] },
  });
  return user;
};

const updateUserStatus = async (userId: string, status: USER_STATUS) => {
  const isUserExist = await User.findOne({
    _id: userId,
    status: { $nin: [USER_STATUS.DELETED] },
  });
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, status: { $nin: [USER_STATUS.DELETED] } },
    { $set: { status } },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update user status.');
  }

  return 'User status updated successfully.';
};

export const getProfile = async (user: JwtPayload) => {
  // --- Fetch user ---
  const isUserExist = await User.findOne({
    _id: user.authId,
    status: { $nin: [USER_STATUS.DELETED] },
  }).select('-authentication -password -location -__v');

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // --- Fetch onboarding + subscription ---
  const [isOnboarded] = await Promise.all([
    Subscription.findOne({
      status: 'active',
      user: user.authId,
    })
      .populate<{ plan: IPlan }>({
        path: 'plan',
        select: 'name price features duration title',
      })
      .lean()
      .exec(),
  ]);

  // --- Build profile response ---
  return {
    ...isUserExist.toObject(),
  };
};


export const UserServices = {
  updateProfile,
  createAdmin,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUserStatus,
  getProfile,
  deleteProfile,
};
