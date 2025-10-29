import express from 'express'
import { HosttermsController } from './hostterms.controller'
import { HosttermsValidations } from './hostterms.validation'
import validateRequest from '../../middleware/validateRequest'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

// /hostterms/
router
  .route('/')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST),
    HosttermsController.getAllHosttermss,
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST),
    validateRequest(HosttermsValidations.create),
    HosttermsController.createHostterms,
  )

router
  .route('/default')
  .get(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.HOST,
      USER_ROLES.GUEST,
    ),
    HosttermsController.getHostDefaultTerms,
  )

// /hostterms/:id
router
  .route('/:id')
  .get(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.HOST,
      USER_ROLES.GUEST,
    ),
    HosttermsController.getSingleHostterms,
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST),
    validateRequest(HosttermsValidations.update),
    HosttermsController.updateHostterms,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.HOST),
    HosttermsController.deleteHostterms,
  )

export const HosttermsRoutes = router
