import express from 'express'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import { NotificationController } from './notifications.controller'

const router = express.Router()
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.CREATOR, USER_ROLES.USER),
  NotificationController.getMyNotifications,
)
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.CREATOR, USER_ROLES.USER),
  NotificationController.updateNotification,
)
router.get(
  '/all',
  auth(USER_ROLES.ADMIN, USER_ROLES.CREATOR, USER_ROLES.USER),
  NotificationController.updateAllNotifications,
)
export const NotificationRoutes = router
