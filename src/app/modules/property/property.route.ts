import express from 'express'
import { PropertyController } from './property.controller'
import { PropertyValidations } from './property.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PropertyController.getAllProperties,
)

router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PropertyController.getSingleProperty,
)

router.post(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),

  validateRequest(PropertyValidations.create),
  PropertyController.createProperty,
)

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),

  validateRequest(PropertyValidations.update),
  PropertyController.updateProperty,
)

router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  PropertyController.deleteProperty,
)

export const PropertyRoutes = router
