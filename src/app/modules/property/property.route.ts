import express from 'express'
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

const handleStemImageUpload = async (req: any, res: any, next: any) => {
  try {
    const payload = req.body;

    // Grab both sets of files from Multer
    const photoFiles = (req.files as any)?.photos as Express.Multer.File[];
    const coverPhotoFiles = (req.files as any)?.coverPhotos as Express.Multer.File[];

    // Upload photos (gallery images)
    let uploadedPhotos: string[] = [];
    if (photoFiles && photoFiles.length > 0) {
      uploadedPhotos = await S3Helper.uploadMultipleFilesToS3(photoFiles, 'image');
      if (!uploadedPhotos.length) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload photos');
      }
    }

    // Upload cover photos (separate field)
    let uploadedCoverPhotos: string[] = [];
    if (coverPhotoFiles && coverPhotoFiles.length > 0) {
      uploadedCoverPhotos = await S3Helper.uploadMultipleFilesToS3(coverPhotoFiles, 'image');
      if (!uploadedCoverPhotos.length) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload cover photos');
      }
    }

    // ✅ Merge results back into req.body
    req.body = {
      ...payload,
      ...(uploadedPhotos.length ? { photos: uploadedPhotos } : {}),
      ...(uploadedCoverPhotos.length ? { coverPhotos: uploadedCoverPhotos } : {}),
    };

    next();
  } catch (error) {
    console.error({ error });
    return res.status(400).json({ message: 'Failed to upload image(s)' });
  }
};



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

  handleStemImageUpload,

  PropertyController.updatePropertyImages, // you can swap in a specific controller if needed
)

export const PropertyRoutes = router
