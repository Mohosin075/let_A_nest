import express from 'express'
import { PropertyController } from './property.controller'
import { PropertyValidations } from './property.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'

const router = express.Router()

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
  PropertyController.updatePropertyImages, // you can swap in a specific controller if needed
)

export const PropertyRoutes = router
