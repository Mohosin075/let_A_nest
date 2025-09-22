import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IPropertyFilterables, IProperty } from './property.interface'
import { Property } from './property.model'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { propertySearchableFields } from './property.constants'
import { Types } from 'mongoose'
import { S3Helper } from '../../../helpers/image/s3helper'
import { Hostterms } from '../hostterms/hostterms.model'

const createProperty = async (
  user: JwtPayload,
  payload: IProperty,
): Promise<IProperty> => {
  try {
    const result = await Property.create({ ...payload, host: user.authId })
    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Property, please try again with valid data.',
      )
    }

    return result
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found')
    }
    throw error
  }
}

const getAllPropertys = async (
  user: JwtPayload,
  filterables: IPropertyFilterables,
  pagination: IPaginationOptions,
) => {
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const andConditions = []

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: propertySearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    })
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    Property.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('host'),
    Property.countDocuments(whereConditions),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  }
}

const getSingleProperty = async (id: string): Promise<IProperty> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  const result = await Property.findById(id).populate('host')
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested property not found, please try again with valid id',
    )
  }

  return result
}

const updateProperty = async (
  id: string,
  user: JwtPayload,
  payload: Partial<IProperty>,
): Promise<IProperty | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID');
  }

  // Update property with payload first
  let result = await Property.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    { new: true, runValidators: true }
  ).populate('host');

  // Determine which host terms to use
  let hostTermsAndCondition;

  const hostTerms = await Hostterms.findOne({ hostId: user.authId, propertyId: id });
  const defaultHostTerms = await Hostterms.findOne({ hostId: user.authId, isDefault: true });

  hostTermsAndCondition = hostTerms?._id || defaultHostTerms?._id;

  console.log({ payload });

  // If host agreed to terms, update property with terms reference
  if (payload.agreedTermsAndConditon) {
    result = await Property.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { hostTermsAndCondition } }, // ✅ fixed: field mapping
      { new: true, runValidators: true }
    ).populate('host');
  }

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested property not found, please try again with valid id'
    );
  }

  return result;
};


const updatePropertyImages = async (
  id: string,
  payload: Partial<IProperty>,
): Promise<IProperty | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  const { photos, coverPhotos } = payload

if (
  !Array.isArray(photos) || photos.length === 0 ||
  !Array.isArray(coverPhotos) || coverPhotos.length === 0
) {
  throw new ApiError(
    StatusCodes.BAD_REQUEST,
    'Both photos and coverPhotos must be non-empty arrays!'
  );
}


  // return

  const result = await Property.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: { photos, coverPhotos } },
    {
      new: true,
      runValidators: true,
    },
  ).populate('host')

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested property not found, please try again with valid id',
    )
  }

  return result
}

const deleteProperty = async (id: string): Promise<IProperty> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID');
  }

  // 1️⃣ Find the property first (so we know which files to remove)
  const property = await Property.findById(id);
  if (!property) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Property not found or already deleted.'
    );
  }
  
  const fileKeys: string[] = [
    ...(property.photos ?? []),
    ...(property.coverPhotos ?? []),
  ];

  await Promise.all(
    fileKeys.map(key => S3Helper.deleteFromS3(key))
  );

  // 4️⃣ Finally remove the property doc itself
  await Property.findByIdAndDelete(id);

  return property;
};


export const PropertyServices = {
  createProperty,
  getAllPropertys,
  getSingleProperty,
  updateProperty,
  updatePropertyImages,
  deleteProperty,
}
