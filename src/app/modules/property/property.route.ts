import express, { NextFunction } from 'express'
import { PropertyController } from './property.controller'
import { PropertyValidations } from './property.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { S3Helper } from '../../../helpers/image/s3helper'

const router = express.Router()

const handleImageUpload = async (req: any, res: any, next: any) => {
  try {
    const payload = req.body

    // Grab both sets of files from Multer
    const photoFiles = (req.files as any)?.photos as Express.Multer.File[]
    const coverPhotoFiles = (req.files as any)
      ?.coverPhotos as Express.Multer.File[]

    // Upload photos (gallery images)
    let uploadedPhotos: string[] = []
    if (photoFiles && photoFiles.length > 0) {
      uploadedPhotos = await S3Helper.uploadMultipleFilesToS3(
        photoFiles,
        'image',
      )
      if (!uploadedPhotos.length) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to upload photos',
        )
      }
    }

    // Upload cover photos (separate field)
    let uploadedCoverPhotos: string[] = []
    if (coverPhotoFiles && coverPhotoFiles.length > 0) {
      uploadedCoverPhotos = await S3Helper.uploadMultipleFilesToS3(
        coverPhotoFiles,
        'image',
      )
      if (!uploadedCoverPhotos.length) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to upload cover photos',
        )
      }
    }

    // ✅ Merge results back into req.body
    req.body = {
      ...payload,
      ...(uploadedPhotos.length ? { photos: uploadedPhotos } : {}),
      ...(uploadedCoverPhotos.length
        ? { coverPhotos: uploadedCoverPhotos }
        : {}),
    }

    next()
  } catch (error) {
    console.error({ error })
    return res.status(400).json({ message: 'Failed to upload image(s)' })
  }
}

const handleDocUpload = async (req: any, res: any, next: any) => {
  const payload = req.body
  try {
    const docFiles = (req.files as any).doc as Express.Multer.File[]
    if (!docFiles || docFiles.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No document file provided')
    }

    // Take the first file only
    const docFile = docFiles

    console.log(docFile)

    // Upload single doc to S3
    const uploadedDocUrl = await S3Helper.uploadMultipleFilesToS3(
      docFile,
      'pdf',
    )

    if (!uploadedDocUrl) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to upload document',
      )
    }

    req.body = {
      ...payload,
      addressProofDocument: uploadedDocUrl, // Store as array
    }
    next()
  } catch (err) {
    res.status(400).json({ message: 'Failed to upload doc' })
  }
}

// Auth roles used everywhere
const roles = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST]

// /api/v1/properties
router
  .route('/')
  .get(auth(...roles), PropertyController.getAllProperties)
  .post(
    auth(...roles),
    validateRequest(PropertyValidations.create),
    PropertyController.createProperty,
  )

router.route('/add-bank-account').patch(
  auth(USER_ROLES.HOST),

  PropertyController.addHostBankAccount,
)

router
  .route('/upload-property-doc/:id')
  .patch(
    auth(USER_ROLES.HOST),
    fileUploadHandler(),
    handleDocUpload,
    PropertyController.verifyPropertyAddress,
  )

// /api/v1/properties/:id
router
  .route('/:id')
  .get(auth(...roles), PropertyController.getSingleProperty)
  .patch(
    auth(...roles),
    validateRequest(PropertyValidations.update),
    PropertyController.updateProperty,
  )
  .delete(auth(...roles), PropertyController.deleteProperty)

// /api/v1/properties/:id/images
router.route('/:id/images').patch(
  auth(...roles),
  fileUploadHandler(),

  handleImageUpload,

  PropertyController.updatePropertyImages,
)

export const PropertyRoutes = router
