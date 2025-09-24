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

  const andConditions: Record<string, any>[] = []

  /* ---------- 🔍 Global text search ---------- */
  if (searchTerm) {
    andConditions.push({
      $or: propertySearchableFields.map(field => {
        const path = field === 'amenities' ? 'details.amenities' : field
        return { [path]: { $regex: searchTerm, $options: 'i' } }
      }),
    })
  }

  /* ---------- 🎯 Structured / field filters ---------- */
  if (Object.keys(filterData).length) {
    const filters: Record<string, any>[] = []

    for (const [key, rawVal] of Object.entries(filterData)) {
      const value = Array.isArray(rawVal) ? rawVal : [rawVal]

      switch (key) {
        case 'amenities':
          // ✅ Case-insensitive match for all requested amenities
          filters.push({
            $and: value.map(v => ({
              'details.amenities': { $regex: new RegExp(`^${v}$`, 'i') },
            })),
          })
          break

        case 'maxGuests':
          filters.push({ 'details.maxGuests': { $gte: Number(value[0]) } })
          break

        case 'bedrooms':
          filters.push({ 'details.bedrooms': { $gte: Number(value[0]) } })
          break

        case 'bathrooms':
          filters.push({ 'details.bathrooms': { $gte: Number(value[0]) } })
          break

        case 'priceMin':
        case 'priceMax':
          break // handled after loop

        case 'from':
        case 'to':
          break // handled after loop for availability

        default:
          // Top-level string fields, case-insensitive
          filters.push({ [key]: { $regex: value[0], $options: 'i' } })
      }
    }

    /* ---------- 💰 Price range ---------- */
    const priceCond: Record<string, number> = {}
    if (
      filterData.priceMin !== undefined &&
      !isNaN(Number(filterData.priceMin))
    ) {
      priceCond.$gte = Number(filterData.priceMin)
    }
    if (
      filterData.priceMax !== undefined &&
      !isNaN(Number(filterData.priceMax))
    ) {
      priceCond.$lte = Number(filterData.priceMax)
    }
    if (Object.keys(priceCond).length > 0) {
      filters.push({ 'details.priceStartingFrom': priceCond })
    }

    /* ---------- 📅 Availability (from-to) ---------- */
    if (filterData.from && filterData.to) {
      const requestedFrom = new Date(filterData.from as string)
      const requestedTo = new Date(filterData.to as string)

      filters.push({
        $and: [
          { 'details.availableDateRanges.from': { $lte: requestedFrom } },
          { 'details.availableDateRanges.to': { $gte: requestedTo } },
        ],
      })
    }

    if (filters.length) andConditions.push({ $and: filters })
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  /* ---------- 🚀 Query + count in parallel ---------- */
  const [result, total] = await Promise.all([
    Property.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate({
        path: 'host',
        select: 'name email phoneNumber', // add/remove host fields as needed
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
