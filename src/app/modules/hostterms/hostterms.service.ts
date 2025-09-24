import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IHostterms } from './hostterms.interface'
import { Hostterms } from './hostterms.model'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { hosttermsSearchableFields } from './hostterms.constants'
import { Types } from 'mongoose'
import { Property } from '../property/property.model'

// for default terms
const createHostterms = async (
  user: JwtPayload,
  payload: IHostterms,
): Promise<IHostterms> => {
  try {
    const filter = { hostId: user.authId, isDefault: true }

    // Check if terms already exist for this property
    let terms = await Hostterms.findOne(filter)

    if (terms) {
      // Update and return the new document
      terms = await Hostterms.findOneAndUpdate(
        filter,
        { ...payload, isDefault: true },
        { new: true, runValidators: true },
      )
      return terms!
    }

    // If not exist, create new terms
    const newTerms = await Hostterms.create({
      ...payload,
      isDefault: true,
      hostId: user.authId,
    })
    return newTerms
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found')
    }
    throw error
  }
}

const getAllHosttermss = async (
  user: JwtPayload,
  filterables: Record<string, any>,
  pagination: IPaginationOptions,
) => {
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const andConditions = []

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: hosttermsSearchableFields.map(field => ({
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
    Hostterms.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('hostId')
      .populate('propertyId'),
    Hostterms.countDocuments(whereConditions),
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

const getHostDefaultTerms = async (user: JwtPayload) => {
  const result = await Hostterms.findOne({
    hostId: user.authId,
    isDefault: true,
  })
  return result
}

const getSingleHostterms = async (
  id: string,
  user: JwtPayload,
): Promise<IHostterms> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Hostterms ID')
  }
  let result
  result = await Hostterms.findOne({
    propertyId: id,
    hostId: user.authId,
  })

  if (!result) {
    result = await Hostterms.findOne({
      hostId: user.authId,
    })
  }

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested hostterms not found, please try again with valid id',
    )
  }

  return result
}

// for property specific terms
export const updateHostterms = async (
  user: JwtPayload,
  propertyId: string,
  payload: IHostterms,
): Promise<IHostterms> => {
  try {
    const filter = { hostId: user.authId, propertyId: propertyId || null }
    const hostProperty = await Property.findOne({
      _id: propertyId,
      host: user.authId,
    })

    if (!hostProperty) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You do not own this property or it does not exist',
      )
    }

    // Check if terms already exist for this property
    let terms = await Hostterms.findOne(filter)

    if (terms) {
      // Update and return the new document
      terms = await Hostterms.findOneAndUpdate(
        filter,
        { ...payload, propertyId },
        { new: true, runValidators: true },
      )

      return terms!
    }

    // If not exist, create new terms
    const newTerms = await Hostterms.create({
      ...payload,
      hostId: user.authId,
      propertyId,
    })

    return newTerms
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found')
    }
    throw error
  }
}

const deleteHostterms = async (id: string): Promise<IHostterms> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Hostterms ID')
  }

  const result = await Hostterms.findByIdAndDelete(id)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting hostterms, please try again with valid id.',
    )
  }

  return result
}

export const HosttermsServices = {
  createHostterms,
  getAllHosttermss,
  getSingleHostterms,
  updateHostterms,
  deleteHostterms,
  getHostDefaultTerms,
}
