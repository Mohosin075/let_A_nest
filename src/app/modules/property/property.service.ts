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

export const getAllPropertys = async (
  user: JwtPayload,
  filterables: IPropertyFilterables,
  pagination: IPaginationOptions,
) => {
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const andConditions: any[] = []

  // --- Search functionality ---
  if (searchTerm) {
    andConditions.push({
      $or: ['title', 'description', 'location', 'postCode', 'bankDetails'].map(
        field => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        }),
      ),
    })
  }

  // --- Filter functionality (supports nested fields) ---
  if (Object.keys(filterData).length) {
    const filters: Record<string, any>[] = []

    for (const [key, value] of Object.entries(filterData)) {
      switch (key) {
        case 'amenities':
          // Must contain *all* amenities passed (string or string[])
          filters.push({
            'details.amenities': {
              $all: Array.isArray(value) ? value : [value],
            },
          })
          break

        case 'maxGuests':
          filters.push({
            'details.maxGuests': { $gte: Number(value) },
          })
          break

        case 'bedrooms':
          filters.push({
            'details.bedrooms': { $gte: Number(value) },
          })
          break

        case 'bathrooms':
          filters.push({
            'details.bathrooms': { $gte: Number(value) },
          })
          break

        case 'priceMin':
        case 'priceMax':
          // handled after loop to combine range
          break

        default:
          // top-level property field
          filters.push({ [key]: value })
      }
    }

    // Combine min / max price into one query
    if (filterData.priceMin || filterData.priceMax) {
      const priceCond: Record<string, number> = {}
      if (filterData.priceMin) priceCond.$gte = Number(filterData.priceMin)
      if (filterData.priceMax) priceCond.$lte = Number(filterData.priceMax)

      filters.push({ 'details.priceStartingFrom': priceCond })
    }

    if (filters.length) {
      andConditions.push({ $and: filters })
    }
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  // --- Query + count in parallel ---
  const [result, total] = await Promise.all([
    Property.find(whereConditions).select('details amenities')
    
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate({
        path: 'host',
        select: 'name email phoneNumber', // add more host fields as needed
      }),
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
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  // Update property with payload first
  let result = await Property.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    { new: true, runValidators: true },
  ).populate('host')

  // Determine which host terms to use
  let hostTermsAndCondition

  const hostTerms = await Hostterms.findOne({
    hostId: user.authId,
    propertyId: id,
  })
  const defaultHostTerms = await Hostterms.findOne({
    hostId: user.authId,
    isDefault: true,
  })

  hostTermsAndCondition = hostTerms?._id || defaultHostTerms?._id

  // If host agreed to terms, update property with terms reference
  if (hostTermsAndCondition) {
    result = await Property.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { hostTermsAndCondition } }, // ✅ fixed: field mapping
      { new: true, runValidators: true },
    ).populate('host')
  }

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested property not found, please try again with valid id',
    )
  }

  return result
}

const updatePropertyImages = async (
  id: string,
  payload: Partial<IProperty>,
): Promise<IProperty | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  const { photos, coverPhotos } = payload

  if (
    !Array.isArray(photos) ||
    photos.length === 0 ||
    !Array.isArray(coverPhotos) ||
    coverPhotos.length === 0
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Both photos and coverPhotos must be non-empty arrays!',
    )
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
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  // 1️⃣ Find the property first (so we know which files to remove)
  const property = await Property.findById(id)
  if (!property) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Property not found or already deleted.',
    )
  }

  const fileKeys: string[] = [
    ...(property.photos ?? []),
    ...(property.coverPhotos ?? []),
  ]

  await Promise.all(fileKeys.map(key => S3Helper.deleteFromS3(key)))

  // 4️⃣ Finally remove the property doc itself
  await Property.findByIdAndDelete(id)

  return property
}

const addHostBankAccount = async (user: JwtPayload) => {
  return user
}

export const verifyPropertyAddress = async (
  id: string,
  user: JwtPayload,
  payload: any,
): Promise<IProperty | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }
  const result = await Property.findOneAndUpdate(
    { _id: id, host: user.authId },
    payload,
    { new: true, runValidators: true },
  ).select('+addressProofDocument')

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Property not found! Provide a valid id.',
    )
  }

  return result
}

export const PropertyServices = {
  createProperty,
  getAllPropertys,
  getSingleProperty,
  updateProperty,
  updatePropertyImages,
  deleteProperty,
  addHostBankAccount,
  verifyPropertyAddress,
}
