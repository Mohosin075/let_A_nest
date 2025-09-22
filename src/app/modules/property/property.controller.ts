import { Request, Response } from 'express'
import { PropertyServices } from './property.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import pick from '../../../shared/pick'
import { propertyFilterables } from './property.constants'
import { paginationFields } from '../../../interfaces/pagination'

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const propertyData = req.body

  const result = await PropertyServices.createProperty(req.user!, propertyData)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Property created successfully',
    data: result,
  })
})

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const propertyData = req.body
  

  const result = await PropertyServices.updateProperty(id, req.user!, propertyData)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Property updated successfully',
    data: result,
  })
})

const updatePropertyImages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const propertyData = req.body

  const result = await PropertyServices.updatePropertyImages(id, propertyData)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Property updated successfully',
    data: result,
  })
})

const getSingleProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await PropertyServices.getSingleProperty(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Property retrieved successfully',
    data: result,
  })
})

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const filterables = pick(req.query, propertyFilterables)
  const pagination = pick(req.query, paginationFields)

  const result = await PropertyServices.getAllPropertys(
    req.user!,
    filterables,
    pagination,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Propertys retrieved successfully',
    data: result,
  })
})

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await PropertyServices.deleteProperty(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Property deleted successfully',
    data: result,
  })
})

export const PropertyController = {
  createProperty,
  updateProperty,
  getSingleProperty,
  getAllProperties,
  deleteProperty,
  updatePropertyImages,
}
