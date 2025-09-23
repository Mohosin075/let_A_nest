import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import config from '../../config'
import { logger } from '../../shared/logger'
import ApiError from '../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import sharp from 'sharp'

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.access_key_id!,
    secretAccessKey: config.aws.secret_access_key!,
  },
})

const getPublicUri = (fileKey: string): string => {
  return `https://${config.aws.bucket_name}.s3.${config.aws.region}.amazonaws.com/${fileKey}`
}

const uploadToS3 = async (
  file: Express.Multer.File,
  folder: 'image' | 'pdf',
): Promise<string> => {
  const fileKey = `${folder}/${Date.now().toString()}-${file.originalname}`
  const params = {
    Bucket: config.aws.bucket_name,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  }
  try {
    const command = new PutObjectCommand(params)
    await s3Client.send(command)
    return getPublicUri(fileKey)
  } catch (error) {
    logger.error('Error uploading to S3:', error)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to upload file to S3')
  }
}

export const deleteFromS3 = async (fileKey: string): Promise<void> => {
  const params = {
    Bucket: config.aws.bucket_name!,
    Key: fileKey,
  }

  try {
    const command = new DeleteObjectCommand(params)
    await s3Client.send(command)
    console.log('deleted')
  } catch (error) {
    logger.error('Error deleting from S3:', error)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete file to S3')
  }
}

const uploadMultipleFilesToS3 = async (
  files: Express.Multer.File[],
  folder: string,
): Promise<string[]> => {
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload')
  }

  const uploadPromises = files.map(async file => {
    // Validate file type
    if (file.mimetype.startsWith('image/')) {
      // process with sharp (resize/compress)
    } else if (file.mimetype.startsWith('video/')) {
      // upload as-is, no sharp
    } else if (file.mimetype === 'application/pdf') {
      // allow PDF, no sharp
    } else {
      throw new Error('Unsupported file type')
    }

    // Generate unique file name
    const fileExtension = file.originalname.split('.').pop()
    const fileKey = `${folder}/${Date.now()}-${file.originalname}`

    try {
      let fileBuffer = file.buffer

      // Optimize only images
      if (file.mimetype.startsWith('image/')) {
        fileBuffer = await sharp(file.buffer)
          .resize(1024)
          .jpeg({ quality: 80 })
          .toBuffer()
      }

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.mimetype,
      }

      const command = new PutObjectCommand(params)
      await s3Client.send(command)
      return getPublicUri(fileKey)
    } catch (error) {
      console.error('Error uploading file to S3:', error)
      return null // continue with other uploads
    }
  })

  const results = await Promise.allSettled(uploadPromises)
  return results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => (result as PromiseFulfilledResult<string>).value)
}

const uploadMultipleVideosToS3 = async (
  files: Express.Multer.File[],
  folder: string,
): Promise<string[]> => {
  if (!files || files.length === 0) {
    throw new Error('No video files provided for upload')
  }

  const uploadPromises = files.map(async file => {
    const fileExtension = file.originalname.split('.').pop()
    const fileKey = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`

    try {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: file.buffer, // Upload raw video
        ContentType: file.mimetype,
      }

      const command = new PutObjectCommand(params)
      await s3Client.send(command)

      return getPublicUri(fileKey)
    } catch (error) {
      console.error('Error uploading video to S3:', error)
      return null
    }
  })

  const results = await Promise.allSettled(uploadPromises)
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => (r as PromiseFulfilledResult<string>).value)
}

export const S3Helper = {
  uploadToS3,
  uploadMultipleFilesToS3,
  uploadMultipleVideosToS3,
  deleteFromS3,
}
