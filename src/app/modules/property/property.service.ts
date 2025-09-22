import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IPropertyFilterables, IProperty } from './property.interface'
import { Property } from './property.model'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { propertySearchableFields } from './property.constants'
import { Types } from 'mongoose'

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
  payload: Partial<IProperty>,
): Promise<IProperty | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  const result = await Property.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
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

const updatePropertyImages = async (
  id: string,
  payload: Partial<IProperty>,
): Promise<IProperty | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Property ID')
  }

  const { photos, coverPhotos } = payload

  console.log({photos, coverPhotos})

  if (!photos || coverPhotos) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Photos and coverPhotos are Required!',
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

  const result = await Property.findByIdAndDelete(id)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting property, please try again with valid id.',
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
}
